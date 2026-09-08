import { StyleSheet, Text, TouchableOpacity } from 'react-native';
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
        <Text style={styles.google}>
            G
        </Text>
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
    google: {
        fontSize: 22,
        fontWeight: '700',
        color: '#4285F4',

        marginRight: 10,
  },
    text: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    }
})
