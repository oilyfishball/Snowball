import { StyleSheet, Text, View } from 'react-native';

interface TabContentProps {
  content: string;
}

export function TabContent({ content }: TabContentProps) {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.contentText}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentText: {
    fontSize: 18,
    color: '#FFFFFF', // Main text
    textAlign: 'center',
  },
});