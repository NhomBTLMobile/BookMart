import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

type Props = {
    title: string;
    onPress: () => void;
}

export default function PrimaryButton({
    title,
    onPress,
}: Props) {
    return(
        <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={onPress}>
            <Text style={styles.text}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 54,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    }
})
