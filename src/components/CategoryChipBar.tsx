import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { CATEGORIES } from '../constants/categories';
import { EventCategory } from '../types/event';

interface CategoryChipBarProps {
  selectedCategory: EventCategory;
  onSelectCategory: (category: EventCategory) => void;
  containerStyle?: ViewStyle;
}

export const CategoryChipBar: React.FC<CategoryChipBarProps> = ({
  selectedCategory,
  onSelectCategory,
  containerStyle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, containerStyle]}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelectCategory(cat.id)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={isSelected ? Colors.white : Colors.textSecondary}
              style={styles.icon}
            />
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 3,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.white,
  },
});
