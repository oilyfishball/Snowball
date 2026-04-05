import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Tab } from '../types';

interface TabBarProps {
  tabs: Tab[];
  activeTab: number;
  onTabPress: (id: number) => void;
}

export function TabBar({ tabs, activeTab, onTabPress }: TabBarProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);

  useEffect(() => {
    const tabWidth = containerWidth.current / tabs.length;
    Animated.spring(translateX, {
      toValue: activeTab * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [activeTab, tabs.length]);

  const onLayout = (e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
    const tabWidth = e.nativeEvent.layout.width / tabs.length;
    translateX.setValue(activeTab * tabWidth);
  };

  return (
    <View style={styles.blurContainer}>
      <View style={styles.glassOverlay}>
        <View style={styles.tabContainer} onLayout={onLayout}>
          <Animated.View
            style={[
              styles.bubble,
              {
                width: `${100 / tabs.length}%` as unknown as number,
                transform: [{ translateX }],
              },
            ]}
          />
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={{ alignItems: 'center' }}>
                <MaterialIcons
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)'}
                />
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText, { fontSize: 12 }]}> 
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    overflow: 'hidden',
    position: 'absolute',
    bottom: 24,
    left: 18,
    right: 'auto',
    borderRadius: 32,
    borderWidth: 0,
    minWidth: 240,
    minHeight: 48,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  glassOverlay: {
    backgroundColor: 'rgba(24, 20, 37, 0.97)',
    borderRadius: 32,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 0,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 32,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
});