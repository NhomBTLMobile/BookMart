import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../../constants/colors';

type Props = {
    title: string;
    onPress: () => void;
};

export default function SocialButton({
    title, 
    onPress,
}: Props) {
    return(
        <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={onPress}>
            <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png' }}
                style={styles.icon}
                contentFit="contain"
            />
            <Text style={styles.text}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        
        marginTop: 16,
    },
    icon: {
        width: 22,
        height: 22,
        marginRight: 10,
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    }
});
