import React from 'react';
import { StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'lucide-react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function EventsScreen() {
  // fake social posts
  const [posts, setPosts] = React.useState(
    [
      { id: 1, sport: 'Basketball', location: 'Rec Center Courts', time: '5:00 PM', likes: 2, liked: false },
      { id: 2, sport: 'Soccer', location: 'Outdoor Fields', time: '6:30 PM', likes: 5, liked: false },
      { id: 3, sport: 'Tennis', location: 'East Campus Courts', time: '4:15 PM', likes: 1, liked: false },
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

  const sportEmoji: Record<string, string> = {
    Basketball: '🏀',
    Soccer: '⚽️',
    Tennis: '🎾',
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f4f3ef', dark: '#353636' }}
      headerImage={
        <Calendar
          size={310}
          color="#808080"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Events
        </ThemedText>
        <Button
          title={showFilters ? 'Hide filters' : 'Show filters'}
          onPress={() => setShowFilters((v) => !v)}
        />
      </ThemedView>
      {/* filter controls, shown only when toggled */}
      {showFilters && (
        <ThemedView style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setExpandSport(v => !v)}>
            <ThemedText>Sport {expandSport ? '▲' : '▼'}</ThemedText>
          </TouchableOpacity>
          {expandSport && (
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
          )}

          <TouchableOpacity onPress={() => setExpandLocation(v => !v)}>
            <ThemedText>Location {expandLocation ? '▲' : '▼'}</ThemedText>
          </TouchableOpacity>
          {expandLocation && (
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
          )}

          <TouchableOpacity onPress={() => setExpandTime(v => !v)}>
            <ThemedText>Time {expandTime ? '▲' : '▼'}</ThemedText>
          </TouchableOpacity>
          {expandTime && (
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
          )}

          <TouchableOpacity onPress={() => setExpandLikes(v => !v)}>
            <ThemedText>Min Likes {expandLikes ? '▲' : '▼'}</ThemedText>
          </TouchableOpacity>
          {expandLikes && (
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
          )}

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
            <ThemedText type="subtitle">
              {sportEmoji[post.sport] ?? '🏅'} {post.sport} game
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
  filterContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
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
  postText: {
    fontSize: 16,
  },
  detailList: {
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
});
