// CompareMasjidDataModal.tsx
import { useGetMasjidDetailsByMasjidId } from "@/apis/masjid/useGetMasjidDetailsByMasjidId";
import { camelToWords } from "@/utils/functions";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { JSX, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  selectedMasjidId: string;
}

const Divider = () => <View style={styles.hr} />;

const colors = {
  INFO: "#1E88E5",
  DANGER: "#F44336",
};

/* -------------------- MEDIA HELPERS -------------------- */

const isImageUrl = (v: string) => /\.(jpg|jpeg|png)$/i.test(v);
const isVideoUrl = (v: string) => /\.(mp4|mov|webm)$/i.test(v);
const isPdfUrl = (v: string) => /\.pdf$/i.test(v);

const renderImageList = (urls: string[]) => (
  <FlatList
    data={urls}
    horizontal
    keyExtractor={(item, index) => item + index}
    showsHorizontalScrollIndicator={false}
    renderItem={({ item }) => (
      <Image
        source={{ uri: item }}
        style={{ width: 120, height: 120, borderRadius: 8, marginRight: 8 }}
      />
    )}
  />
);

const VideoItem = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, p => {
    p.loop = false;
  });

  return (
    <VideoView
      style={{ width: 220, height: 140, borderRadius: 8, marginRight: 8 }}
      player={player}
      allowsFullscreen
    />
  );
};

const renderVideoList = (urls: string[]) => (
  <FlatList
    data={urls}
    horizontal
    keyExtractor={(item, index) => item + index}
    showsHorizontalScrollIndicator={false}
    renderItem={({ item }) => <VideoItem uri={item} />}
  />
);

const renderPdf = (url: string) => (
  <Text
    style={{ color: colors.INFO, textDecorationLine: "underline" }}
    onPress={() => Linking.openURL(url)}
  >
    View PDF
  </Text>
);

/* -------------------- MEDIA BLOCK -------------------- */

const MediaBlock = ({
  label,
  oldContent,
  newContent,
}: {
  label: string;
  oldContent: JSX.Element | null;
  newContent: JSX.Element | null;
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>

    {oldContent && (
      <View style={{ marginTop: 6 }}>
        <Text style={styles.label}>Old:</Text>
        {oldContent}
      </View>
    )}

    {newContent && (
      <View style={{ marginTop: 6 }}>
        <Text style={styles.label}>New:</Text>
        {newContent}
      </View>
    )}
  </View>
);

/* -------------------- COMPONENT -------------------- */

const CompareMasjidDataModal: React.FC<Props> = ({
  visible = false,
  onClose = () => {},
  title = "Review Changes",
  selectedMasjidId,
}) => {
  const [updatedMasjidData, setUpdatedMasjidData] = useState<any>(null);

  if (!selectedMasjidId) return null;

  const { data, isLoading, isError, isRefetching } =
    useGetMasjidDetailsByMasjidId(selectedMasjidId);

  const selectedMasjid = useMemo(() => {
    if (isLoading || isError) return null;
    setUpdatedMasjidData(data?.updatedMasjidData);
    return data;
  }, [data, isLoading, isError]);

  /* -------------------- DIFF LOGIC -------------------- */

  const isPlainObject = (v: any) =>
    v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);

  const renderPrimitive = (v: any) =>
    v === null || v === undefined || v === "" ? "-" : String(v);

  const renderFields = (
    currentData: any,
    updatedData: any,
    parentKey = ""
  ): JSX.Element[] => {
    const cur = currentData ?? {};
    const upd = updatedData ?? {};

    const keys = Object.keys(upd);
    const primitiveRows: JSX.Element[] = [];
    const nestedRows: JSX.Element[] = [];

    for (const key of keys) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const newVal = upd[key];
      const oldVal = cur?.[key];

      if (newVal === undefined && oldVal === undefined) continue;
      if (newVal === null || newVal === "") continue;

      /* ---------- MEDIA ARRAYS (images / videos) ---------- */
      if (Array.isArray(newVal) && newVal.every(v => typeof v === "string")) {
        const oldArr = Array.isArray(oldVal) ? oldVal : [];

        if (newVal.some(isImageUrl)) {
          primitiveRows.push(
            <MediaBlock
              key={`img-${fullKey}`}
              label={camelToWords(key)}
              oldContent={oldArr.length ? renderImageList(oldArr) : null}
              newContent={renderImageList(newVal)}
            />
          );
          continue;
        }

        if (newVal.some(isVideoUrl)) {
          primitiveRows.push(
            <MediaBlock
              key={`vid-${fullKey}`}
              label={camelToWords(key)}
              oldContent={oldArr.length ? renderVideoList(oldArr) : null}
              newContent={renderVideoList(newVal)}
            />
          );
          continue;
        }
      }

      /* ---------- SINGLE MEDIA (qrCode / pdf) ---------- */
      if (typeof newVal === "string") {
        if (isImageUrl(newVal)) {
          primitiveRows.push(
            <MediaBlock
              key={`img-${fullKey}`}
              label={camelToWords(key)}
              oldContent={
                oldVal && isImageUrl(oldVal) ? (
                  <Image
                    source={{ uri: oldVal }}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                ) : null
              }
              newContent={
                <Image
                  source={{ uri: newVal }}
                  style={{ width: 120, height: 120, borderRadius: 8 }}
                />
              }
            />
          );
          continue;
        }

        if (isPdfUrl(newVal)) {
          primitiveRows.push(
            <MediaBlock
              key={`pdf-${fullKey}`}
              label={camelToWords(key)}
              oldContent={oldVal ? renderPdf(oldVal) : null}
              newContent={renderPdf(newVal)}
            />
          );
          continue;
        }
      }

      /* ---------- NESTED OBJECT ---------- */
      if (isPlainObject(newVal) || isPlainObject(oldVal)) {
        const children = renderFields(
          isPlainObject(oldVal) ? oldVal : {},
          isPlainObject(newVal) ? newVal : {},
          fullKey
        );
        if (children.length) {
          nestedRows.push(
            <View key={`section-${fullKey}`}>
              <Text style={styles.sectionTitle}>{camelToWords(key)}</Text>
              {children}
            </View>
          );
        }
        continue;
      }

      /* ---------- PRIMITIVE ---------- */
      primitiveRows.push(
        <View style={styles.field} key={`field-${fullKey}`}>
          <Text style={styles.fieldLabel}>{camelToWords(key)}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Old:</Text>
            <Text style={styles.oldValue}>{renderPrimitive(oldVal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>New:</Text>
            <Text style={styles.newValue}>{renderPrimitive(newVal)}</Text>
          </View>
        </View>
      );
    }

    return [...primitiveRows, ...nestedRows];
  };

  if (!updatedMasjidData || !selectedMasjid) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtnSmall}>
              <Text style={styles.closeBtnTextSmall}>Close</Text>
            </TouchableOpacity>
          </View>

          {isLoading || isRefetching ? (
            <ActivityIndicator size="large" />
          ) : isError ? (
            <Text style={{ color: colors.DANGER }}>Error loading data</Text>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {renderFields(selectedMasjid, selectedMasjid.updatedMasjidData)}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: SCREEN_W * 0.94,
    height: SCREEN_H * 0.9,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "700" },
  closeBtnSmall: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeBtnTextSmall: { color: "#fff", fontWeight: "700" },
  scrollContent: { padding: 14 },
  field: { marginVertical: 6 },
  fieldLabel: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginTop: 10 },
  row: { flexDirection: "row" },
  label: { fontWeight: "700", marginRight: 6 },
  oldValue: { color: "red", fontWeight: "600" },
  newValue: { color: "green", fontWeight: "600" },
  hr: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
});

export default CompareMasjidDataModal;
