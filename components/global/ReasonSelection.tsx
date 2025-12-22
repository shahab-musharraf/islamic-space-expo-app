// ReasonSelection.tsx
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Props = {
  visible: boolean;
  reason: string | null;
  setReason: Dispatch<SetStateAction<string>>
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading: boolean;
};

const REASONS = [
  'Incorrect account details',
  'Incorrect UPI Id',
  'Incorrect QR Code',
  'Incorrect Masjid Images',
  'Incorrect Masjid Videos',
  'Incorrect Secretary Name',
  'Incorrect Secretary Mobile Number',
  'Incorrect Address',
  'Incorrect Pincode',
  'Incorrect City/State',
  'Incorrect budget info',
  'Invalid prayer timings',
  'other',
];

const ReasonSelection: React.FC<Props> = ({ visible, reason, setReason, onConfirm, onCancel, isLoading }) => {

  console.log(reason)
  const [selected, setSelected] = useState<string[]>([]);
  const [localOther, setLocalOther] = useState<string>('');
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!visible) {
      setSelected([]);
      setLocalOther('');
      setReason('');
      return;
    }
    if (reason) {
      const parts = reason.split('%').map((p) => p.trim()).filter(Boolean);
      setSelected(parts);
      const other = parts.find((p) => p.startsWith('Other-'));
      if (other) setLocalOther(other.replace(/^Other-/, ''));
    } else {
      setSelected([]);
      setLocalOther('');
    }
  }, [visible]);

  useEffect(() => {
    // update parent with joined reasons whenever selection changes
    if (selected.length === 0) {
      setReason('');
      return;
    }
    setReason(selected.join('%'));
  }, [selected, setReason]);

  const toggleReason = (r: string) => {
    if (r === 'other') {
      // open other (add placeholder if not exists)
      const exists = selected.some((s) => s.startsWith('Other-'));
      if (!exists) {
        const val = localOther.trim() ? `Other-${localOther.trim()}` : 'Other-';
        setSelected((prev) => [...prev, val]);
        // scroll to bottom so textarea is visible
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        setSelected((prev) => prev.filter((p) => !p.startsWith('Other-')));
      }
      return;
    }

    setSelected((prev) => {
      if (prev.includes(r)) return prev.filter((p) => p !== r);
      return [...prev, r];
    });
  };

  const onOtherChange = (text: string) => {
    setLocalOther(text);
    setSelected((prev) => {
      const others = prev.filter((p) => !p.startsWith('Other-'));
      if (text.trim() === '') {
        return others;
      }
      return [...others, `Other-${text.trim()}`];
    });
  };

  const confirm = () => {
    if (selected.length === 0) return;
    if (selected.some((s) => s.startsWith('Other-')) && !localOther.trim()) return;
    if (onConfirm) onConfirm();
  };

  const cancel = () => {
    if (onCancel) onCancel();
  };

  const renderItem = ({ item }: { item: string }) => {
    const display = item === 'other' ? 'Other' : item;
    const isSelected =
      item === 'other'
        ? selected.some((s) => s.startsWith('Other-'))
        : selected.includes(item);

    return (
      <TouchableOpacity
        style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
        onPress={() => toggleReason(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>{display}</Text>
      </TouchableOpacity>
    );
  };

  const onTextareaFocus = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
      >
        <View style={styles.backdrop} />

        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.title}>Select reason(s) for rejection</Text>

            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <FlatList
                data={REASONS}
                keyExtractor={(i) => i}
                renderItem={renderItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
              />

              {selected.some((s) => s.startsWith('Other-')) && (
                <View style={styles.otherContainer}>
                  <TextInput
                    placeholder="Write reason..."
                    value={localOther}
                    onChangeText={onOtherChange}
                    multiline
                    numberOfLines={4}
                    style={styles.textarea}
                    onFocus={onTextareaFocus}
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.confirmBtn,
                  (selected.length === 0 || (selected.some((s) => s.startsWith('Other-')) && !localOther.trim())) &&
                    styles.disabledBtn,
                ]}
                onPress={confirm}
                disabled={selected.length === 0 || (selected.some((s) => s.startsWith('Other-')) && !localOther.trim())}
              >
                <Text style={styles.confirmText}>{
                    isLoading ? <ActivityIndicator color={'white'} size={14}/> : 'Confirm'
                }</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardWrapper: { width: '100%', alignItems: 'center' },
  card: {
    width: '88%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 6,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  scrollContent: { paddingBottom: 8 },
  reasonRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  reasonRowSelected: { backgroundColor: '#1f6feb' },
  reasonText: { fontSize: 14, color: '#111' },
  reasonTextSelected: { color: '#fff', fontWeight: '600' },
  otherContainer: { marginTop: 10 },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
    backgroundColor: '#fff',
  },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  cancelBtn: { backgroundColor: '#eee' },
  confirmBtn: { backgroundColor: '#007bff' },
  cancelText: { color: '#333', fontWeight: '600' },
  confirmText: { color: '#fff', fontWeight: '700', minWidth: 50, textAlign:'center' },
  disabledBtn: { opacity: 0.5 },
});

export default ReasonSelection;
