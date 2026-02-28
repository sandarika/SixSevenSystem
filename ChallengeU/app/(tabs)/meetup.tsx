import React from 'react';
import { StyleSheet, TouchableOpacity, Button, Modal, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar, Plus, X } from 'lucide-react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function EventsScreen() {
  // fake social posts
  const [posts, setPosts] = React.useState(
    [
      { id: 1, sport: 'Basketball', location: 'Rec Center Courts', time: '5:00 PM', likes: 2, liked: false, gender: 'COED' },
      { id: 2, sport: 'Soccer', location: 'Outdoor Fields', time: '6:30 PM', likes: 5, liked: false, gender: 'Mens' },
      { id: 3, sport: 'Tennis', location: 'East Campus Courts', time: '4:15 PM', likes: 1, liked: false, gender: 'Womens' },
    ],
  );

  // filter state
  const [sportFilter, setSportFilter] = React.useState('');
  const [locationFilter, setLocationFilter] = React.useState('');
  const [timeFilter, setTimeFilter] = React.useState('');
  const [minLikes, setMinLikes] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  // expand toggles for individual fields
  const [expandSport, setExpandSport] = React.useState(false);
  const [expandLocation, setExpandLocation] = React.useState(false);
  const [expandTime, setExpandTime] = React.useState(false);
  const [expandLikes, setExpandLikes] = React.useState(false);

  // modal and form state
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    sport: '',
    location: '',
    time: '',
    gender: 'COED',
  });
  // modal picker expand toggles
  const [expandFormSport, setExpandFormSport] = React.useState(true);
  const [expandFormLocation, setExpandFormLocation] = React.useState(true);
  const [expandFormTime, setExpandFormTime] = React.useState(true);
  const [expandFormGender, setExpandFormGender] = React.useState(true);

  // preset searches
  const presets = [
    { label: 'All basketball', filters: { sport: 'Basketball' } },
    { label: 'Rec Center games', filters: { location: 'Rec Center' } },
    { label: 'This evening', filters: { time: '5' } },
  ];

  const filteredPosts = posts.filter((p) => {
    if (sportFilter && p.sport !== sportFilter) return false;
    if (locationFilter && p.location !== locationFilter) return false;
    if (timeFilter && !p.time.includes(timeFilter)) return false;
    if (minLikes && p.likes < parseInt(minLikes, 10)) return false;
    return true;
  });

  const toggleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const liked = !p.liked;
          return { ...p, liked, likes: p.likes + (liked ? 1 : -1) };
        }
        return p;
      }),
    );
  };

  const handleCreateEvent = () => {
    if (!formData.sport || !formData.location || !formData.time) {
      alert('Please fill in all fields');
      return;
    }
    const newPost = {
      id: Math.max(...posts.map((p) => p.id), 0) + 1,
      sport: formData.sport,
      location: formData.location,
      time: formData.time,
      gender: formData.gender,
      likes: 0,
      liked: false,
    };
    setPosts([...posts, newPost]);
    setFormData({ sport: '', location: '', time: '', gender: 'COED' });
    setShowCreateModal(false);
  };

  const sportEmoji: Record<string, string> = {
    Basketball: '🏀',
    Soccer: '⚽️',
    Tennis: '🎾',
    Volleyball: '🏐',
    Badminton: '🏸',
  };

  const generateTimes = (intervalMinutes = 30) => {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const minute = m.toString().padStart(2, '0');
        const suffix = h < 12 ? 'AM' : 'PM';
        out.push(`${hour12}:${minute} ${suffix}`);
      }
    }
    return out;
  };

  const timeOptions = React.useMemo(() => generateTimes(30), []);

  return (
    <ThemedView style={{ flex: 1, position: 'relative' }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#f4f3ef', dark: '#353636' }}
        headerImage={
          <Calendar
            size={310}
            color="#e80e0e"
            style={styles.headerImage}
          />
        }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Meetup
        </ThemedText>
        <ThemedView style={styles.filterToggle}>
          <Button
            title={showFilters ? 'Hide filters' : 'Show filters'}
            onPress={() => setShowFilters((v) => !v)}
          />
        </ThemedView>
      </ThemedView>
      {/* filter controls, shown only when toggled */}
      {showFilters && (
        <ThemedView style={styles.filterContainer}>
          {/* each filter section styled as card */}
          <ThemedView style={styles.filterSection}>
            <TouchableOpacity onPress={() => setExpandSport(v => !v)}>
              <ThemedText style={styles.filterHeading}>Sport {expandSport ? '▲' : '▼'}</ThemedText>
            </TouchableOpacity>
            {expandSport && (
              <>
                <Picker
                  selectedValue={sportFilter}
                  onValueChange={setSportFilter}
                  style={styles.picker}
                >
                  <Picker.Item label="(any)" value="" />
                  <Picker.Item label="Basketball" value="Basketball" />
                  <Picker.Item label="Soccer" value="Soccer" />
                  <Picker.Item label="Tennis" value="Tennis" />
                </Picker>
                <ThemedView style={styles.applyButton}>
                  <Button title="Apply" onPress={() => setExpandSport(false)} color="#e80e0e" />
                </ThemedView>
              </>
            )}
          </ThemedView>

          <ThemedView style={styles.filterSection}>
            <TouchableOpacity onPress={() => setExpandLocation(v => !v)}>
              <ThemedText style={styles.filterHeading}>Location {expandLocation ? '▲' : '▼'}</ThemedText>
            </TouchableOpacity>
            {expandLocation && (
              <>
                <Picker
                  selectedValue={locationFilter}
                  onValueChange={setLocationFilter}
                  style={styles.picker}
                >
                  <Picker.Item label="(any)" value="" />
                  <Picker.Item label="Rec Center Courts" value="Rec Center Courts" />
                  <Picker.Item label="Outdoor Fields" value="Outdoor Fields" />
                  <Picker.Item label="East Campus Courts" value="East Campus Courts" />
                </Picker>
                <ThemedView style={styles.applyButton}>
                  <Button title="Apply" onPress={() => setExpandLocation(false)} color="#e80e0e" />
                </ThemedView>
              </>
            )}
          </ThemedView>

          <ThemedView style={styles.filterSection}>
            <TouchableOpacity onPress={() => setExpandTime(v => !v)}>
              <ThemedText style={styles.filterHeading}>Time {expandTime ? '▲' : '▼'}</ThemedText>
            </TouchableOpacity>
            {expandTime && (
              <>
                <Picker
                  selectedValue={timeFilter}
                  onValueChange={setTimeFilter}
                  style={styles.picker}
                >
                  <Picker.Item label="(any)" value="" />
                  <Picker.Item label="4:00 PM" value="4" />
                  <Picker.Item label="5:00 PM" value="5" />
                  <Picker.Item label="6:30 PM" value="6" />
                </Picker>
                <ThemedView style={styles.applyButton}>
                  <Button title="Apply" onPress={() => setExpandTime(false)} color="#e80e0e" />
                </ThemedView>
              </>
            )}
          </ThemedView>

          <ThemedView style={styles.filterSection}>
            <TouchableOpacity onPress={() => setExpandLikes(v => !v)}>
              <ThemedText style={styles.filterHeading}>Min Likes {expandLikes ? '▲' : '▼'}</ThemedText>
            </TouchableOpacity>
            {expandLikes && (
              <>
                <Picker
                  selectedValue={minLikes}
                  onValueChange={setMinLikes}
                  style={styles.picker}
                >
                  <Picker.Item label="0" value="" />
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="5" value="5" />
                </Picker>
                <ThemedView style={styles.applyButton}>
                  <Button title="Apply" onPress={() => setExpandLikes(false)} color="#e80e0e" />
                </ThemedView>
              </>
            )}
          </ThemedView>

          <Button title="Clear filters" onPress={() => {
            setSportFilter('');
            setLocationFilter('');
            setTimeFilter('');
            setMinLikes('');
          }} />

          {/* preset searches */}
          <ThemedView style={styles.presetContainer}>
            {presets.map((p, i) => (
              <Button
                key={i}
                title={p.label}
                onPress={() => {
                  setSportFilter(p.filters.sport || '');
                  setLocationFilter(p.filters.location || '');
                  setTimeFilter(p.filters.time || '');
                }}
              />
            ))}
          </ThemedView>
        </ThemedView>
      )}

      <ThemedView style={styles.postList}>
        {filteredPosts.map((post) => (
          <ThemedView key={post.id} style={styles.postCard}>
            <ThemedText type="subtitle" style={styles.postTitle}>
              {sportEmoji[post.sport] ?? '🏅'} {post.sport} - {post.gender}
            </ThemedText>
            <ThemedView style={styles.detailList}>
              <ThemedText style={styles.detailText}>Where: {post.location}</ThemedText>
              <ThemedText style={styles.detailText}>When: {post.time}</ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={() => toggleLike(post.id)} style={styles.likeButton}>
              <ThemedText style={styles.likeText}>
                {post.liked ? '❤️' : '🤍'} {post.likes}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ThemedView>
    </ParallaxScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="title">Create New Game</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#e80e0e" />
              </TouchableOpacity>
            </ThemedView>

            <ScrollView style={styles.formContainer}>
              <ThemedText style={styles.formLabel}>Sport</ThemedText>
              <TouchableOpacity onPress={() => setExpandFormSport(v => !v)}>
                <ThemedText style={styles.filterHeading}>
                  {formData.sport ? formData.sport : 'Select sport'} {expandFormSport ? '▲' : '▼'}
                </ThemedText>
              </TouchableOpacity>
              {expandFormSport && (
                <>
                  <Picker
                    selectedValue={formData.sport}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sport: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a sport..." value="" />
                    <Picker.Item label="Basketball" value="Basketball" />
                    <Picker.Item label="Soccer" value="Soccer" />
                    <Picker.Item label="Tennis" value="Tennis" />
                    <Picker.Item label="Volleyball" value="Volleyball" />
                    <Picker.Item label="Badminton" value="Badminton" />
                  </Picker>
                  <ThemedView style={styles.applyButton}>
                    <Button title="Apply" onPress={() => setExpandFormSport(false)} color="#e80e0e" />
                  </ThemedView>
                </>
              )}

              <ThemedText style={styles.formLabel}>Location</ThemedText>
              <TouchableOpacity onPress={() => setExpandFormLocation(v => !v)}>
                <ThemedText style={styles.filterHeading}>
                  {formData.location ? formData.location : 'Select location'} {expandFormLocation ? '▲' : '▼'}
                </ThemedText>
              </TouchableOpacity>
              {expandFormLocation && (
                <>
                  <Picker
                    selectedValue={formData.location}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select location..." value="" />
                    <Picker.Item label="Campus Rec Center" value="Campus Rec Center" />
                    <Picker.Item label="East Campus Rec Center" value="East Campus Rec Center" />
                    <Picker.Item label="Outdoor Adventure Center" value="Outdoor Adventure Center" />
                    <Picker.Item label="HSSV Courts" value="HSSV Courts" />
                    <Picker.Item label="Suite Courts" value="Suite Courts" />
                    <Picker.Item label="Cather Courts" value="Cather Courts" />
                  </Picker>
                  <ThemedView style={styles.applyButton}>
                    <Button title="Apply" onPress={() => setExpandFormLocation(false)} color="#e80e0e" />
                  </ThemedView>
                </>
              )}

              <ThemedText style={styles.formLabel}>Time</ThemedText>
              <TouchableOpacity onPress={() => setExpandFormTime(v => !v)}>
                <ThemedText style={styles.filterHeading}>
                  {formData.time ? formData.time : 'Select time'} {expandFormTime ? '▲' : '▼'}
                </ThemedText>
              </TouchableOpacity>
              {expandFormTime && (
                <>
                  <Picker
                    selectedValue={formData.time}
                    onValueChange={(value) =>
                      setFormData({ ...formData, time: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a time..." value="" />
                    {timeOptions.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                  <ThemedView style={styles.applyButton}>
                    <Button title="Apply" onPress={() => setExpandFormTime(false)} color="#e80e0e" />
                  </ThemedView>
                </>
              )}

              <ThemedText style={styles.formLabel}>Gender</ThemedText>
              <TouchableOpacity onPress={() => setExpandFormGender(v => !v)}>
                <ThemedText style={styles.filterHeading}>
                  {formData.gender ? formData.gender : 'Select gender'} {expandFormGender ? '▲' : '▼'}
                </ThemedText>
              </TouchableOpacity>
              {expandFormGender && (
                <>
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="COED" value="COED" />
                    <Picker.Item label="Mens" value="Mens" />
                    <Picker.Item label="Womens" value="Womens" />
                  </Picker>
                  <ThemedView style={styles.applyButton}>
                    <Button title="Apply" onPress={() => setExpandFormGender(false)} color="#e80e0e" />
                  </ThemedView>
                </>
              )}
            </ScrollView>

            <ThemedView style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowCreateModal(false)}
                color="#999"
              />
              <Button
                title="Create Game"
                onPress={handleCreateEvent}
                color="#e80e0e"
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  postList: {
    marginTop: 16,
    gap: 12,
  },
  filterToggle: {
    right: -15,
    position: 'absolute',
  },
  filterContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  filterSection: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
    backgroundColor: '#fafafa',
  },
  filterHeading: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    width: '100%',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 4,
  },
  postCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  postTitle: {
    flexWrap: 'wrap',
  },
  postText: {
    fontSize: 16,
  },
  detailList: {
    backgroundColor: '#fff',
    marginLeft: 8,
    gap: 2,
  },
  detailText: {
    // keep default text color (no tint or background change)
  },
  likeButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  likeText: {
    fontSize: 16,
    color: '#e80e0e',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e80e0e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  formContainer: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  applyButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    width: 100,
  },
});
