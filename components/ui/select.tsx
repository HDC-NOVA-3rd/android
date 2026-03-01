import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView } from "react-native";
import { Input } from "./input";

// Very basic mock implementation of Select for this prototype
interface SelectProps {
  onValueChange: (value: string) => void;
  value?: string;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  id?: string;
}

interface SelectValueProps {
  placeholder: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}

// Context to share state between components
const SelectContext = React.createContext<{
  value?: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  value: undefined,
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

export function Select({ onValueChange, value, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <View>{children}</View>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children }: SelectTriggerProps) {
  const { setOpen } = React.useContext(SelectContext);
  return (
    <TouchableOpacity onPress={() => setOpen(true)} style={styles.trigger}>
      {children}
    </TouchableOpacity>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  return <Text style={value ? styles.value : styles.placeholder}>{value || placeholder}</Text>;
}

export function SelectContent({ children }: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext);

  // Flatten children to an array if it's not already
  const items = React.Children.toArray(children);

  return (
    <Modal visible={open} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={true} onStartShouldSetResponder={() => true}>
            {items}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function SelectItem({ value, children }: SelectItemProps) {
  const { onValueChange, setOpen } = React.useContext(SelectContext);

  const handlePress = () => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <TouchableOpacity style={styles.item} onPress={handlePress}>
      <Text style={styles.itemText}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  value: {
    fontSize: 14,
    color: "#111827",
  },
  placeholder: {
    fontSize: 14,
    color: "#9ca3af",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    maxHeight: "50%",
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemText: {
    fontSize: 16,
    color: "#111827",
  },
});
