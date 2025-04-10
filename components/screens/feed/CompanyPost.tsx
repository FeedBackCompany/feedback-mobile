import { TouchableOpacity, StyleSheet } from 'react-native';
import { Title, Paragraph, Text } from 'react-native-paper';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentPost } from '../../../hooks/useCurrentPost';

export default function CompanyPost({ _route, navigation }: any) {
    const { currentPost, clearCurrentPost } = useCurrentPost();

    const handleNavigateToFeedClick = () => {
        clearCurrentPost();
        navigation.navigate('Feed Page');
    }

    if (!currentPost) return (
        <SafeAreaView style={styles.container}>
            <Text>Unable to find post {':('}</Text>
            <TouchableOpacity 
                onPress={handleNavigateToFeedClick}
            >
                <Text>{'<-'} Go to your feed</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )

    const { name, title, description, reward, status } = currentPost;

    return (
        <SafeAreaView style={styles.container}>
            <Title>{name}</Title>
            <Title>{title}</Title>
            <Paragraph>{description}</Paragraph>
            <Text variant="labelMedium">
                Reward:
                <CurrencyDisplay amount={reward} />
            </Text>
            <Text variant="labelMedium">Status: {status}</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
    }
})