import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Linking } from 'react-native';

interface CompanyProfileLinksProps {
    email: string;
    phone_number: string;
    website: string;
}

const CompanyProfileLinks: React.FC<CompanyProfileLinksProps> = ({ email, phone_number, website }) => {
    const [loadingIcon, setLoadingIcon] = useState<string | null>(null);
    const [dotAnim] = useState(new Animated.Value(0)); // Animated value to control the dot animation

    useEffect(() => {
        if (loadingIcon) {
            // Start the animation when loading starts for the specific icon
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dotAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotAnim, {
                        toValue: 2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotAnim, {
                        toValue: 3,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            // Reset animation when no icon is being loaded
            dotAnim.setValue(0);
        }
    }, [loadingIcon, dotAnim]);

    const handleLinkPress = (url: string, type: string) => {
        setLoadingIcon(type); // Set loading state to true for the clicked icon
        setTimeout(() => {
            setLoadingIcon(null); // Reset loading state after a short delay (simulate loading completion)
            if (type === 'email') {
                Linking.openURL(`mailto:${url}`);
            } else if (type === 'phone') {
                Linking.openURL(`tel:${url}`);
            } else if (type === 'website') {
                Linking.openURL(url);
            }
        }, 1500); // Simulate a delay for loading
    };

    return (
        <View style={styles.iconBackground}>
            <View style={styles.iconContainer}>
                {/* Email */}
                <View style={styles.iconWithDots}>
                    <TouchableOpacity
                        onPress={() => handleLinkPress(email, 'email')}
                        style={styles.icon}
                    >
                        <MaterialIcons name="email" size={30} color="gray" />
                    </TouchableOpacity>
                    {loadingIcon === 'email' && (
                        <View style={styles.dotsContainer}>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 1, 0, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 0, 1, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 0, 0, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                        </View>
                    )}
                </View>

                {/* Phone */}
                <View style={styles.iconWithDots}>
                    <TouchableOpacity
                        onPress={() => handleLinkPress(phone_number, 'phone')}
                        style={styles.icon}
                    >
                        <MaterialIcons name="phone" size={30} color="gray" />
                    </TouchableOpacity>
                    {loadingIcon === 'phone' && (
                        <View style={styles.dotsContainer}>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 1, 0, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 0, 1, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 0, 0, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                        </View>
                    )}
                </View>

                {/* Website */}
                <View style={styles.iconWithDots}>
                    <TouchableOpacity
                        onPress={() => handleLinkPress(website, 'website')}
                        style={styles.icon}
                    >
                        <MaterialIcons name="language" size={30} color="gray" />
                    </TouchableOpacity>
                    {loadingIcon === 'website' && (
                        <View style={styles.dotsContainer}>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 1, 0, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 0, 1, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                            <Animated.Text
                                style={[
                                    styles.dots,
                                    {
                                        opacity: dotAnim.interpolate({
                                            inputRange: [0, 1, 2, 3],
                                            outputRange: [0, 0, 0, 1],
                                        }),
                                    },
                                ]}
                            >
                                .
                            </Animated.Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    iconBackground: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    iconWithDots: {
        alignItems: 'center',
        marginBottom: 0,
    },
    icon: {
        marginBottom: 0,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dots: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'gray',
    },
});

export default CompanyProfileLinks;
