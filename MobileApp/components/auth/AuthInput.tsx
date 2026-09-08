import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';

type props = {
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    secureTextEntry?: boolean;
    value: string;
    onChangeText: (text: string) => void;
    showPassword?: boolean;
    onTongglePassword?: () => void;
};

export default function AuthInput({
    icon,
    placeholder,
    secureTextEntry = false,
    value,
    onChangeText,
    showPassword,
    onTongglePassword,
}: props){
    return(
        <View style={styles.container}>
            <Ionicons name={icon} size={21} color={COLORS.textSecondary}/>
            <TextInput 
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Show/Hide Password */}
            {secureTextEntry && onTongglePassword && (
                <TouchableOpacity onPress ={onTongglePassword}>
                    <Ionicons name = {showPassword ? 'eye-outline': 'eye-off-outline'} size={21} color={COLORS.textSecondary}/>
                </TouchableOpacity>
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: COLORS.surface,
        marginBottom: 14,
    },
    input:{
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: COLORS.text
    }
});