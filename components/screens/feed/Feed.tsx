import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Text, Animated, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Provider as PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

import CompanyPostCard from './CompanyPostCard';
import FilterModal from './FilterModal';

import { PostStatus, type PostWithRelations } from '../../../types/posts';
import type { FilterOptions } from '../../../types/filters';

type SortOption = {
    label: 'Most Recent' | 'Oldest' | 'Reward: Low to High' | 'Reward: High to Low';
    value: 'recent' | 'oldest' | 'reward_asc' | 'reward_desc';
    query: {
        column: keyof PostWithRelations;
        ascending: boolean;
    }[];
}

const POSTS_PER_PAGE = 9;
const SORT_OPTIONS: SortOption[] = [
  { 
    label: 'Most Recent', 
    value: 'recent', 
    query: [
      { column: 'created_at', ascending: false }
    ]
  },
  { 
    label: 'Oldest', 
    value: 'oldest', 
    query: [
      { column: 'created_at', ascending: true }
    ]
  },
  { 
    label: 'Reward: Low to High', 
    value: 'reward_asc', 
    query: [
      { column: 'reward', ascending: true },
    ]
  },
  { 
    label: 'Reward: High to Low', 
    value: 'reward_desc', 
    query: [
      { column: 'reward', ascending: false },
    ]
  }
];

const defaultFilters: FilterOptions = {
    minReward: 0,
    maxReward: 10000,
    status: [PostStatus.OPEN, PostStatus.CLOSING_SOON],
    createdWithin: 'all',
};

export default function Feed({ route, navigation }: any) {
    const [loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostWithRelations[]>([]);
    const [firstPostId, setFirstPostId] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filtersHaveChangedFromDefault, setFiltersHaveChangedFromDefault] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({ ...defaultFilters });

    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);

    const toggleFilterModal = () => {
        setFilterModalVisible((prev) => !prev);
    };

    const listRef = useRef<FlashList<PostWithRelations>>(null);
    const fadeAnimation = useRef(new Animated.Value(0)).current;

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.y;
        if (scrollPosition > 300 && !showScrollToTop) {
            setShowScrollToTop(true);
            Animated.timing(fadeAnimation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else if (scrollPosition <= 300 && showScrollToTop) {
            setShowScrollToTop(false);
            Animated.timing(fadeAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    const scrollToTop = () => {
        if (listRef.current) {
            listRef.current.scrollToIndex({ 
                index: 0,
                animated: true 
            });
        }
    };

    const handleSortChange = (option: typeof SORT_OPTIONS[0]) => {
        setSelectedSort(option);
        setSortMenuVisible(false);
        // Reset pagination and fetch posts with new sort
        setPage(0);
        setHasMore(true);
        setPosts([]);
        getPosts(option);
    };

    const handleApplyFilters = (newFilters: FilterOptions) => {
        const defaultFiltersCopy = { ...defaultFilters };
        setFiltersHaveChangedFromDefault(
            defaultFiltersCopy.createdWithin !== newFilters.createdWithin
            || defaultFiltersCopy.maxReward !== newFilters.maxReward
            || defaultFiltersCopy.minReward !== newFilters.minReward
            || defaultFiltersCopy.status.length !== newFilters.status.length
        );
        setFilters(newFilters);
        setPage(0);
        setHasMore(true);
        setPosts([]);
        getPosts(selectedSort, newFilters);
    };

    useEffect(() => {
        getPosts(selectedSort);
    }, [])

    const getPosts = async (sortOption?: SortOption, filterOptions = filters) => {
        setLoading(true);
        try {
            const sortOrderChanged = !!sortOption;

            if (!sortOption) {
                sortOption = selectedSort;
            }

            let query = supabase
                .from('posts')
                .select('*, company:company_profiles(*)')
                .limit(POSTS_PER_PAGE);

            // Apply filters
            if (filterOptions.minReward > 0) {
                query = query.gte('reward', filterOptions.minReward);
            }
            if (filterOptions.maxReward < 10000) {
                query = query.lte('reward', filterOptions.maxReward);
            }
            if (filterOptions.status.length > 0) {
                query = query.in('status', filterOptions.status);
            }
            if (filterOptions.createdWithin !== 'all') {
                const now = new Date();
                let fromDate = new Date();
                
                switch (filterOptions.createdWithin) {
                    case '24h':
                        fromDate.setHours(now.getHours() - 24);
                        break;
                    case '7d':
                        fromDate.setDate(now.getDate() - 7);
                        break;
                    case '30d':
                        fromDate.setDate(now.getDate() - 30);
                        break;
                }
                
                query = query.gte('created_at', fromDate.toISOString());
            }


            // Apply all sort orders
            sortOption.query.forEach(sort => {
                query = query.order(sort.column, { ascending: sort.ascending });
            });

            // If not first page, get posts after the last post we have
            if (page > 0 && !sortOrderChanged && posts.length > 0) {
                const lastPost = posts[posts.length - 1];
                const primarySort = sortOption.query[0];
                const compareValue = lastPost[primarySort.column];
                
                if (primarySort.ascending) {
                    query = query.gt(primarySort.column, compareValue);
                } else {
                    query = query.lt(primarySort.column, compareValue);
                }
                
                // For equal primary sort values, apply secondary sort condition
                if (sortOption.query.length > 1) {
                    query = query.or(`and(${primarySort.column}.eq.${compareValue},${sortOption.query[1].column}.${sortOption.query[1].ascending ? 'lt' : 'gt'}.${lastPost[sortOption.query[1].column]})`);
                }
            }

            const { data, error } = await query;

            if (error) throw error;

            if (!data || data.length < POSTS_PER_PAGE) {
                setHasMore(false);
            }
            
            if (page === 0 || sortOrderChanged) {
                setPosts(data || []);
                if (data?.length > 0) setFirstPostId(data[0].id);
            } else {
                setPosts(prev => [...prev, ...(data || [])]);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
            getPosts();
        }
    }

    return (
        <PaperProvider>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <Pressable 
                        style={styles.headerButton}
                        onPress={toggleFilterModal}
                    >
                        <Ionicons name="filter-outline" size={15} color={'#333'} />
                        <Text style={styles.buttonText}>Filters</Text>
                    </Pressable>

                    <Menu
                        visible={sortMenuVisible}
                        onDismiss={() => setSortMenuVisible(false)}
                        contentStyle={styles.menuStyles}
                        anchor={
                            <Pressable 
                                style={styles.headerButton}
                                onPress={() => setSortMenuVisible(true)}
                            >
                                <MaterialCommunityIcons name="sort" size={15} color={'#333'} />
                                <Text style={styles.buttonText}>{selectedSort.label}</Text>
                            </Pressable>
                        }
                    >
                        {SORT_OPTIONS.map((option) => (
                            <Menu.Item
                                key={option.value}
                                onPress={() => handleSortChange(option)}
                                title={option.label}
                            />
                        ))}
                    </Menu>
                </View>

                {/* Llist of Posts */}
                {posts.length > 0 ? (
                    <FlashList
                        ref={listRef}
                        style={styles.container}
                        data={posts}
                        renderItem={({ item }) => {
                            return <CompanyPostCard 
                                post={item} 
                                route={route} 
                                navigation={navigation} 
                                isFirstInFeed={item.id === firstPostId} 
                            />; 
                        }}
                        estimatedItemSize={9} // ! Making this value larger affects the inifinte loading
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.6}
                        onScroll={handleScroll}
                    />
                ) : (
                    <Text>{
                        loading ? '' 
                        : `No Posts to show${filtersHaveChangedFromDefault ? ' based on the filters you selected. Try changing your filters or pull down to refresh.' : '. Please pull down to refresh.'}`
                    }</Text>
                )}

                {/* Filter Modal */}
                <FilterModal 
                    isVisible={filterModalVisible}
                    onClose={toggleFilterModal}
                    onApplyFilters={handleApplyFilters}
                    currentFilters={filters}
                />

                {/* Back to Top button */}
                <Animated.View style={[
                    styles.scrollToTopContainer, 
                    { opacity: fadeAnimation }
                ]}>
                    <Pressable onPress={scrollToTop} style={styles.scrollToTopButton}>
                        <Feather name="arrow-up" size={15} color="white" />
                        <Text style={styles.scrollToTopText}>Back to Top</Text>
                    </Pressable>
                </Animated.View>
            </SafeAreaView>
        </PaperProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        height: '100%',
        width: '100%',
    },
    // Scroll to top
    scrollToTopContainer: {
        display: 'flex',
        width: '100%',
        position: 'absolute',
        bottom: 24,
        left: 0,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    scrollToTopButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(90, 90, 90, 0.90)',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    scrollToTopText: {
        color: '#fff',
        fontSize: 14,
    },
    // Filters and Sort
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        zIndex: 1,
    },
    headerButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'white', 
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    buttonText: {
        fontSize: 14,
        color: '#333',
        marginHorizontal: 3
    },
    menuStyles: {
        backgroundColor: 'white'
    }
})