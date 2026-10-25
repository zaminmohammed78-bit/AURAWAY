import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Linking, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

type Tab = "Home" | "Map" | "Discover" | "Budget" | "Safety";
type PlaceType = "Scenic viewpoints" | "Hotels" | "Restaurants" | "Fuel stations" | "EV charging" | "Rest stops" | "Hospitals" | "Police";
type SavedPlace = { id: string; name: string; note: string };
const ink = "#07111F";
const panel = "#101E30";
const panel2 = "#15263B";
const mint = "#67E8C1";
const muted = "#9AAEC2";
const placeSearch: Record<PlaceType, string> = {
  "Scenic viewpoints": "scenic viewpoints near me",
  Hotels: "budget hotels near me",
  Restaurants: "restaurants near me",
  "Fuel stations": "petrol pumps near me",
  "EV charging": "EV charging stations near me",
  "Rest stops": "rest areas and rest stops near me",
  Hospitals: "hospitals near me",
  Police: "police stations near me"
};

export default function App() {
  const [tab, setTab] = useState<Tab>("Home");
  const [permission, setPermission] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">("satellite");
  const [destination, setDestination] = useState("");
  const [tripName, setTripName] = useState("Weekend escape");
  const [budget, setBudget] = useState("5000");
  const [spent, setSpent] = useState("0");
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenses, setExpenses] = useState<{name: string; amount: number}[]>([]);
  const [saved, setSaved] = useState<SavedPlace[]>([]);
  const [notes, setNotes] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType>("Scenic viewpoints");

  const region: Region = useMemo(() => ({
    latitude: coords?.latitude ?? 11.2588,
    longitude: coords?.longitude ?? 75.7804,
    latitudeDelta: coords ? 0.08 : 0.25,
    longitudeDelta: coords ? 0.08 : 0.25
  }), [coords]);

  useEffect(() => {
    (async () => {
      const result = await Location.getForegroundPermissionsAsync();
      setPermission(result.granted);
      if (result.granted) getLocation();
    })();
  }, []);

  async function getLocation() {
    try {
      setLoadingLocation(true);
      const current = await Location.requestForegroundPermissionsAsync();
      setPermission(current.granted);
      if (!current.granted) {
        Alert.alert("Location permission", "Allow location access in your phone settings to show your position. The app still works without it.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch {
      Alert.alert("Location unavailable", "We couldn't get your location right now. Check GPS and try again.");
    } finally {
      setLoadingLocation(false);
    }
  }

  async function openUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Can't open this right now", "Please check your internet connection and try again.");
    }
  }

  function openPlaceSearch(type: PlaceType) {
    setPlaceType(type);
    const query = encodeURIComponent(placeSearch[type]);
    const ll = coords ? `&query=${coords.latitude},${coords.longitude}` : "";
    openUrl(`https://www.google.com/maps/search/?api=1&query=${query}${ll}`);
  }

  function startNavigation() {
    const dest = destination.trim();
    if (!dest) {
      Alert.alert("Add a destination", "Type a place, town, or address first.");
      return;
    }
    const origin = coords ? `&origin=${coords.latitude},${coords.longitude}` : "";
    openUrl(`https://www.google.com/maps/dir/?api=1${origin}&destination=${encodeURIComponent(dest)}&travelmode=driving`);
  }

  function addExpense() {
    const amount = Number(expenseAmount);
    if (!expenseName.trim() || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Check expense", "Enter an expense name and a valid amount.");
      return;
    }
    setExpenses(old => [...old, { name: expenseName.trim(), amount }]);
    setSpent(String(Number(spent || 0) + amount));
    setExpenseName("");
    setExpenseAmount("");
  }

  function addSaved(name: string, note = "Saved for this trip") {
    if (saved.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert("Already saved", "This place is already in your saved list.");
      return;
    }
    setSaved(old => [...old, { id: String(Date.now()), name, note }]);
    Alert.alert("Saved", `${name} added to your trip list.`);
  }

  const budgetRemaining = Number(budget || 0) - Number(spent || 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor={ink} />
      <View style={styles.header}>
        <View style={styles.brandMark}><Ionicons name="navigate" size={21} color={ink} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>AURA <Text style={{ color: mint }}>WAY</Text></Text>
          <Text style={styles.tagline}>TAKE THE SCENIC ROUTE</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={getLocation} accessibilityLabel="Refresh location">
          {loadingLocation ? <ActivityIndicator color={mint} /> : <Ionicons name="locate-outline" size={22} color={mint} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "Home" && <>
          <View style={styles.hero}>
            <View style={styles.heroPill}><View style={styles.liveDot} /><Text style={styles.pillText}>YOUR NEXT ADVENTURE STARTS HERE</Text></View>
            <Text style={styles.heroTitle}>The road is{"\n"}calling{" "} <Text style={{ color: mint }}>you.</Text></Text>
            <Text style={styles.bodyText}>Plan smarter, find hidden gems, and make every kilometre count.</Text>
            <View style={styles.inputRow}>
              <Ionicons name="search" size={20} color={muted} />
              <TextInput value={destination} onChangeText={setDestination} placeholder="Where are we going?" placeholderTextColor={muted} style={styles.destinationInput} returnKeyType="go" onSubmitEditing={startNavigation} />
              <TouchableOpacity style={styles.goButton} onPress={startNavigation}><Ionicons name="arrow-forward" size={20} color={ink} /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.mapPreview} onPress={() => setTab("Map")} activeOpacity={0.9}>
              <View style={styles.mapPreviewGrid}><Ionicons name="map" size={38} color={mint} /><View style={styles.mapPin}><Ionicons name="location" size={22} color={ink} /></View></View>
              <View style={styles.mapPreviewBottom}><View><Text style={styles.mapTitle}>Explore the map</Text><Text style={styles.smallText}>Satellite view · Your location · Nearby finds</Text></View><Ionicons name="arrow-up-right" size={23} color={mint} /></View>
            </TouchableOpacity>
          </View>
          <SectionTitle title="YOUR ROAD TRIP TOOLKIT" subtitle="Everything you need, all in one place" />
          <View style={styles.grid}>
            <FeatureCard icon="leaf" title="Scenic spots" subtitle="Views worth the detour" onPress={() => openPlaceSearch("Scenic viewpoints")} />
            <FeatureCard icon="bed" title="Stay & save" subtitle="Find budget stays" onPress={() => openPlaceSearch("Hotels")} />
            <FeatureCard icon="flash" title="EV & fuel" subtitle="Power up on the way" onPress={() => openPlaceSearch("EV charging")} />
            <FeatureCard icon="restaurant" title="Food stops" subtitle="Find a bite nearby" onPress={() => openPlaceSearch("Restaurants")} />
            <FeatureCard icon="cloud" title="Weather" subtitle="Check conditions" onPress={() => openUrl("https://weather.google.com/")} />
            <FeatureCard icon="musical-notes" title="Road tunes" subtitle="Open your music" onPress={() => openUrl("https://music.youtube.com/")} />
          </View>
          <View style={styles.tipCard}><Ionicons name="bulb-outline" size={22} color={mint} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>A little road wisdom</Text><Text style={styles.bodyText}>Take breaks, check the weather before leaving, and never use your phone while driving.</Text></View></View>
        </>}

        {tab === "Map" && <>
          <SectionTitle title="YOUR ADVENTURE MAP" subtitle="Satellite imagery and location tools" />
          <View style={styles.mapControls}>
            {(["standard", "satellite", "hybrid"] as const).map(type => <TouchableOpacity key={type} onPress={() => setMapType(type)} style={[styles.mapMode, mapType === type && styles.mapModeActive]}><Text style={[styles.mapModeText, mapType === type && { color: ink }]}>{type.toUpperCase()}</Text></TouchableOpacity>)}
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              mapType={mapType}
              key={coords ? "located-map" : "default-map"}
              initialRegion={region}
              showsUserLocation={permission}
              showsMyLocationButton={false}
              toolbarEnabled
              loadingEnabled
            >
              {coords && <Marker coordinate={coords} title="You are here" description="Your current location" pinColor={mint} />}
            </MapView>
            <TouchableOpacity style={styles.mapLocate} onPress={getLocation}><Ionicons name="locate" size={22} color={ink} /></TouchableOpacity>
          </View>
          <Text style={styles.helper}>Map opens around Kozhikode until you allow location. Satellite and hybrid imagery depend on map-provider coverage and a configured native Maps API key.</Text>
          <Text style={styles.sectionTitle}>FIND SOMETHING NEARBY</Text>
          <View style={styles.chipWrap}>{(["Scenic viewpoints", "Hotels", "Restaurants", "Fuel stations", "EV charging", "Rest stops"] as PlaceType[]).map(t => <TouchableOpacity key={t} style={styles.chip} onPress={() => openPlaceSearch(t)}><Text style={styles.chipText}>{t}</Text><Ionicons name="open-outline" size={14} color={mint} /></TouchableOpacity>)}</View>
          <Text style={styles.sectionTitle}>GET DIRECTIONS</Text>
          <TextInput value={destination} onChangeText={setDestination} placeholder="Enter destination or address" placeholderTextColor={muted} style={styles.textInput} />
          <PrimaryButton title="Open driving directions" icon="navigate" onPress={startNavigation} />
        </>}

        {tab === "Discover" && <>
          <SectionTitle title="DISCOVER THE WAY" subtitle="Useful stops and experiences along the route" />
          <View style={styles.searchHero}><Ionicons name="compass-outline" size={35} color={mint} /><Text style={styles.cardTitle}>Find your next stop</Text><Text style={styles.bodyText}>Search nearby places in Maps. Results and directions are supplied by your map app.</Text></View>
          {(["Scenic viewpoints", "Hotels", "Restaurants", "Fuel stations", "EV charging", "Rest stops"] as PlaceType[]).map((t, i) => <TouchableOpacity key={t} style={styles.listRow} onPress={() => openPlaceSearch(t)}><View style={styles.listIcon}><Ionicons name={(["camera", "bed", "restaurant", "speedometer", "flash", "cafe"] as const)[i]} size={22} color={mint} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{t}</Text><Text style={styles.smallText}>Search places around your current area</Text></View><Ionicons name="chevron-forward" size={20} color={muted} /></TouchableOpacity>)}
          <SectionTitle title="YOUR SAVED STOPS" subtitle={saved.length ? `${saved.length} saved for this trip` : "Keep your must-visit places together"} />
          <View style={styles.formCard}><TextInput value={tripName} onChangeText={setTripName} style={styles.textInput} placeholder="Trip name" placeholderTextColor={muted} /><TextInput value={destination} onChangeText={setDestination} style={styles.textInput} placeholder="Place to save" placeholderTextColor={muted} /><PrimaryButton title="Save this place" icon="bookmark" onPress={() => destination.trim() ? addSaved(destination.trim(), tripName || "Trip") : Alert.alert("Add a place", "Enter a place name first.")} /></View>
          {saved.map(item => <View key={item.id} style={styles.savedRow}><Ionicons name="bookmark" size={19} color={mint} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.smallText}>{item.note}</Text></View><TouchableOpacity onPress={() => setSaved(old => old.filter(x => x.id !== item.id))}><Ionicons name="close-circle-outline" size={22} color={muted} /></TouchableOpacity></View>)}
        </>}

        {tab === "Budget" && <>
          <SectionTitle title="TRIP BUDGET" subtitle="Keep your travel spending in check" />
          <View style={styles.budgetHero}><Text style={styles.smallText}>ESTIMATED MONEY LEFT</Text><Text style={[styles.moneyBig, budgetRemaining < 0 && { color: "#FF8C8C" }]}>₹{budgetRemaining.toLocaleString("en-IN")}</Text><View style={styles.budgetTrack}><View style={[styles.budgetFill, { width: `${Math.min(100, Math.max(0, Number(budget) > 0 ? Number(spent) / Number(budget) * 100 : 0))}%` }]} /></View><View style={styles.statRow}><View><Text style={styles.smallText}>TOTAL BUDGET</Text><Text style={styles.statValue}>₹{Number(budget || 0).toLocaleString("en-IN")}</Text></View><View><Text style={styles.smallText}>SPENT</Text><Text style={styles.statValue}>₹{Number(spent || 0).toLocaleString("en-IN")}</Text></View></View></View>
          <View style={styles.formCard}><Text style={styles.fieldLabel}>YOUR BUDGET (₹)</Text><TextInput value={budget} onChangeText={setBudget} keyboardType="numeric" style={styles.textInput} placeholder="5000" placeholderTextColor={muted} /><Text style={styles.fieldLabel}>ADD AN EXPENSE</Text><TextInput value={expenseName} onChangeText={setExpenseName} style={styles.textInput} placeholder="Fuel, food, hotel…" placeholderTextColor={muted} /><TextInput value={expenseAmount} onChangeText={setExpenseAmount} keyboardType="decimal-pad" style={styles.textInput} placeholder="Amount in ₹" placeholderTextColor={muted} /><PrimaryButton title="Add expense" icon="add-circle" onPress={addExpense} /></View>
          <Text style={styles.sectionTitle}>EXPENSE HISTORY</Text>
          {expenses.length === 0 ? <Text style={styles.helper}>No expenses yet. Add your first cost above.</Text> : expenses.map((e, i) => <View key={i} style={styles.expenseRow}><View style={styles.listIcon}><Ionicons name="receipt-outline" size={20} color={mint} /></View><Text style={[styles.cardTitle, { flex: 1 }]}>{e.name}</Text><Text style={styles.expenseAmount}>₹{e.amount.toLocaleString("en-IN")}</Text></View>)}
          <TouchableOpacity style={styles.resetButton} onPress={() => Alert.alert("Reset expenses?", "This clears the expense list and resets spent to zero.", [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: () => { setExpenses([]); setSpent("0"); } }])}><Text style={styles.resetText}>Reset expense list</Text></TouchableOpacity>
          <Text style={styles.helper}>Current trip data stays in memory while the app is open. Persistent offline storage can be added next.</Text>
        </>}

        {tab === "Safety" && <>
          <View style={styles.safetyHero}><View style={styles.safetyIcon}><Ionicons name="shield-checkmark" size={32} color={mint} /></View><Text style={styles.heroTitle}>Travel with{"\n"}peace of mind.</Text><Text style={styles.bodyText}>Quick access to help and useful safety tools. Pull over safely before using your phone.</Text></View>
          <Text style={styles.sectionTitle}>EMERGENCY QUICK ACCESS</Text>
          <View style={styles.emergencyGrid}>
            <EmergencyCard icon="medkit" title="Hospital" onPress={() => openPlaceSearch("Hospitals")} />
            <EmergencyCard icon="shield" title="Police" onPress={() => openPlaceSearch("Police")} />
            <EmergencyCard icon="flame" title="Fire services" onPress={() => openUrl("https://www.google.com/maps/search/?api=1&query=fire+station+near+me")} />
            <EmergencyCard icon="car" title="Roadside help" onPress={() => openUrl("https://www.google.com/maps/search/?api=1&query=roadside+assistance+near+me")} />
          </View>
          <TouchableOpacity style={styles.sosButton} onPress={() => Alert.alert("Emergency help", "In India, call 112 for emergency assistance. Only place a call if you need help.", [{ text: "Cancel", style: "cancel" }, { text: "Call 112", onPress: () => openUrl("tel:112") }])}><Ionicons name="call" size={21} color="#FFFFFF" /><Text style={styles.sosText}>SOS · CALL 112 (INDIA)</Text></TouchableOpacity>
          <TouchableOpacity style={styles.listRow} onPress={() => openUrl("https://mausam.imd.gov.in/")}><View style={styles.listIcon}><Ionicons name="cloudy" size={23} color={mint} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Weather alerts</Text><Text style={styles.smallText}>Check official India Meteorological Department updates</Text></View><Ionicons name="open-outline" size={18} color={muted} /></TouchableOpacity>
          <TouchableOpacity style={styles.listRow} onPress={() => openUrl("https://www.google.com/maps/")}><View style={styles.listIcon}><Ionicons name="share-social" size={23} color={mint} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Share your trip</Text><Text style={styles.smallText}>Share your live location from your maps app</Text></View><Ionicons name="open-outline" size={18} color={muted} /></TouchableOpacity>
          <View style={styles.notice}><Ionicons name="information-circle-outline" size={20} color={mint} /><Text style={styles.noticeText}>Live family tracking, automatic crash detection, background location and one-tap contact alerts need extra setup, permissions and a secure backend. They are not active in this starter version.</Text></View>
          <SectionTitle title="TRIP NOTES" subtitle="Keep reminders for your journey" />
          <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={5} textAlignVertical="top" style={[styles.textInput, styles.notesInput]} placeholder="Pack water, confirm hotel booking…" placeholderTextColor={muted} />
        </>}
      </ScrollView>

      <View style={styles.tabBar}>
        {([
          ["Home", "home-outline"], ["Map", "map-outline"], ["Discover", "compass-outline"], ["Budget", "wallet-outline"], ["Safety", "shield-checkmark-outline"]
        ] as [Tab, keyof typeof Ionicons.glyphMap][]).map(([name, icon]) => <TouchableOpacity key={name} style={styles.tabItem} onPress={() => setTab(name)}><Ionicons name={icon} size={21} color={tab === name ? mint : muted} /><Text style={[styles.tabLabel, tab === name && { color: mint }]}>{name}</Text>{tab === name && <View style={styles.tabActive} />}</TouchableOpacity>)}
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.smallText}>{subtitle}</Text> : null}</View>;
}
function FeatureCard({ icon, title, subtitle, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return <TouchableOpacity style={styles.featureCard} onPress={onPress}><View style={styles.featureIcon}><Ionicons name={icon} size={22} color={mint} /></View><Text style={styles.cardTitle}>{title}</Text><Text style={styles.smallText}>{subtitle}</Text><Ionicons name="arrow-up-right" size={17} color={muted} style={styles.featureArrow} /></TouchableOpacity>;
}
function PrimaryButton({ title, icon, onPress }: { title: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return <TouchableOpacity style={styles.primaryButton} onPress={onPress}><Ionicons name={icon} size={19} color={ink} /><Text style={styles.primaryButtonText}>{title}</Text></TouchableOpacity>;
}
function EmergencyCard({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void }) {
  return <TouchableOpacity style={styles.emergencyCard} onPress={onPress}><Ionicons name={icon} size={25} color={mint} /><Text style={styles.cardTitle}>{title}</Text><Text style={styles.smallText}>Find nearby</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ink },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 12 : 8, paddingBottom: 13, gap: 11, borderBottomWidth: 1, borderBottomColor: "#1C2A3C" },
  brandMark: { width: 39, height: 39, borderRadius: 13, backgroundColor: mint, alignItems: "center", justifyContent: "center" },
  brand: { color: "#F4F8FC", fontSize: 18, fontWeight: "900", letterSpacing: 1.8 },
  tagline: { color: muted, fontSize: 9, letterSpacing: 1.7, marginTop: 2, fontWeight: "700" },
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: panel, alignItems: "center", justifyContent: "center" },
  content: { padding: 19, paddingBottom: 28 },
  hero: { paddingTop: 7 },
  heroPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#112D31", borderColor: "#215047", borderWidth: 1, borderRadius: 30, paddingHorizontal: 11, paddingVertical: 7 },
  liveDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: mint },
  pillText: { color: mint, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  heroTitle: { color: "#F4F8FC", fontSize: 39, lineHeight: 44, fontWeight: "900", letterSpacing: -1.2, marginTop: 18 },
  bodyText: { color: muted, fontSize: 13, lineHeight: 20, marginTop: 9 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: panel, borderColor: "#263A50", borderWidth: 1, borderRadius: 17, paddingLeft: 14, paddingRight: 6, marginTop: 22, minHeight: 57 },
  destinationInput: { color: "#F4F8FC", flex: 1, paddingHorizontal: 10, fontSize: 14, minWidth: 0 },
  goButton: { width: 43, height: 43, borderRadius: 13, backgroundColor: mint, alignItems: "center", justifyContent: "center" },
  mapPreview: { backgroundColor: panel, borderRadius: 20, borderWidth: 1, borderColor: "#25384C", marginTop: 17, overflow: "hidden" },
  mapPreviewGrid: { height: 123, backgroundColor: "#122A34", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 30 },
  mapPin: { width: 37, height: 37, borderRadius: 20, backgroundColor: mint, alignItems: "center", justifyContent: "center" },
  mapPreviewBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15 },
  mapTitle: { color: "#F4F8FC", fontSize: 15, fontWeight: "800", marginBottom: 5 },
  smallText: { color: muted, fontSize: 11, lineHeight: 16 },
  sectionHeader: { marginTop: 28, marginBottom: 14 },
  sectionTitle: { color: "#F4F8FC", fontSize: 12, fontWeight: "900", letterSpacing: 1.25, marginBottom: 5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: { width: "48%", flexGrow: 1, minHeight: 139, backgroundColor: panel, borderRadius: 17, borderWidth: 1, borderColor: "#1E3045", padding: 14, justifyContent: "flex-start" },
  featureIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: "#18343A", alignItems: "center", justifyContent: "center", marginBottom: 11 },
  cardTitle: { color: "#F4F8FC", fontSize: 13, fontWeight: "800", marginBottom: 4 },
  featureArrow: { position: "absolute", top: 15, right: 13 },
  tipCard: { flexDirection: "row", gap: 12, backgroundColor: panel, borderWidth: 1, borderColor: "#20364A", borderRadius: 17, padding: 15, marginTop: 17, alignItems: "flex-start" },
  mapControls: { flexDirection: "row", backgroundColor: panel, padding: 5, borderRadius: 14, gap: 4, marginBottom: 12 },
  mapMode: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  mapModeActive: { backgroundColor: mint },
  mapModeText: { color: muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  mapContainer: { height: 360, borderRadius: 20, overflow: "hidden", backgroundColor: panel, borderWidth: 1, borderColor: "#263A50" },
  mapLocate: { position: "absolute", right: 12, bottom: 12, backgroundColor: mint, width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  helper: { color: muted, fontSize: 11, lineHeight: 17, marginTop: 10, marginBottom: 7 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 17 },
  chip: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: panel, borderWidth: 1, borderColor: "#263A50", borderRadius: 20, paddingVertical: 10, paddingHorizontal: 12 },
  chipText: { color: "#EAF1F8", fontSize: 11, fontWeight: "700" },
  textInput: { backgroundColor: panel, color: "#F4F8FC", borderColor: "#263A50", borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, marginTop: 9, fontSize: 14 },
  primaryButton: { backgroundColor: mint, minHeight: 49, borderRadius: 14, marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 15 },
  primaryButtonText: { color: ink, fontWeight: "900", fontSize: 13 },
  searchHero: { backgroundColor: "#112D31", borderColor: "#215047", borderWidth: 1, borderRadius: 19, padding: 18, marginBottom: 12, gap: 6 },
  listRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: panel, borderRadius: 15, padding: 13, marginBottom: 9, borderWidth: 1, borderColor: "#1E3045" },
  listIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: "#18343A", alignItems: "center", justifyContent: "center" },
  formCard: { backgroundColor: panel, borderRadius: 17, padding: 14, borderWidth: 1, borderColor: "#203449", marginBottom: 15 },
  savedRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13, backgroundColor: panel, borderRadius: 13, marginBottom: 8 },
  budgetHero: { backgroundColor: panel, borderRadius: 20, borderWidth: 1, borderColor: "#263A50", padding: 20, marginTop: 8 },
  moneyBig: { color: mint, fontSize: 36, fontWeight: "900", marginTop: 7, marginBottom: 16 },
  budgetTrack: { height: 8, borderRadius: 5, backgroundColor: "#263A50", overflow: "hidden" },
  budgetFill: { height: 8, borderRadius: 5, backgroundColor: mint },
  statRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  statValue: { color: "#F4F8FC", fontWeight: "800", fontSize: 17, marginTop: 4 },
  fieldLabel: { color: muted, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 12 },
  expenseRow: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: panel, borderRadius: 14, padding: 12, marginBottom: 8 },
  expenseAmount: { color: mint, fontWeight: "900", fontSize: 14 },
  resetButton: { alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 2 },
  resetText: { color: "#FF9D9D", fontSize: 12, fontWeight: "700" },
  safetyHero: { backgroundColor: panel, borderRadius: 21, borderWidth: 1, borderColor: "#263A50", padding: 20, marginTop: 5 },
  safetyIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: "#18343A", alignItems: "center", justifyContent: "center" },
  emergencyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  emergencyCard: { width: "48%", flexGrow: 1, backgroundColor: panel, borderRadius: 16, padding: 15, minHeight: 112, borderWidth: 1, borderColor: "#263A50", gap: 7 },
  sosButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#C83D4B", borderRadius: 15, padding: 16, marginTop: 15 },
  sosText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", letterSpacing: 0.8 },
  notice: { flexDirection: "row", gap: 9, padding: 13, backgroundColor: "#112D31", borderRadius: 14, marginTop: 14, alignItems: "flex-start" },
  noticeText: { color: "#B7D7D2", flex: 1, fontSize: 11, lineHeight: 17 },
  notesInput: { minHeight: 110, marginBottom: 18 },
  tabBar: { flexDirection: "row", backgroundColor: "#0B1726", borderTopColor: "#203146", borderTopWidth: 1, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 20 : 8, paddingHorizontal: 5 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 },
  tabLabel: { color: muted, fontSize: 9, fontWeight: "700" },
  tabActive: { position: "absolute", top: -8, width: 22, height: 2, borderRadius: 2, backgroundColor: mint }
});