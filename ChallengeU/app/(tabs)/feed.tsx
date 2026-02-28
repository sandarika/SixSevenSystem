import { StyleSheet, FlatList, View, TouchableOpacity, Modal, TextInput, Alert, Platform, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity, Heart, Plus, Camera, MessageCircle, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Comment = {
  _id: string;
  username: string;
  text: string;
  likes: number;
};

type Workout = {
  _id: string;
  username: string;
  calories: number;
  date: string;
  likes: number;
  imageUrl?: string;
  comments?: Comment[];
};

// Demo Herbie Husker post
const DEMO_WORKOUT: Workout = {
  _id: 'demo-herbie',
  username: 'Vittoria',
  calories: 670,
  date: new Date().toISOString(),
  likes: 0,
  imageUrl: require('../../assets/images/workout0img.png'),
  comments: [
    {
      _id: 'demo-comment-1',
      username: 'Lucy',
      text: 'Wow!',
      likes: 0,
    },
  ],
};

 // Demo Lucy post
 const DEMO_WORKOUT_LUCY: Workout = {
   _id: 'demo-lucy',
   username: 'Lucy',
   calories: 520,
   date: new Date(Date.now() - 3600000).toISOString(),
   likes: 2,
   imageUrl: require('../../assets/images/workout1img.png'),
   comments: [],
 };

 // Demo Sandi post
 const DEMO_WORKOUT_SANDI: Workout = {
   _id: 'demo-sandi',
   username: 'Sandi',
   calories: 450,
   date: new Date(Date.now() - 7200000).toISOString(),
   likes: 1,
   imageUrl: require('../../assets/images/workout2img.png'),
   comments: [],
 };

export default function FeedScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [demoComments, setDemoComments] = useState<Comment[]>(DEMO_WORKOUT.comments || []);
  type WorkoutState = { likes: number; liked: boolean };
  const [feedState, setFeedState] = useState<Record<string, WorkoutState>>({});
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [calories, setCalories] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  
  // Comment state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentUsername, setCommentUsername] = useState('');
  const [commentLikes, setCommentLikes] = useState<Record<string, Record<string, boolean>>>({});
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const headerBackgroundColor = { light: '#f4f3ef', dark: '#1D3D47' };

  const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    if (Platform.OS === 'android') {
      // Android emulator listens on 10.0.2.2 for host machine
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  };

  const fetchWorkouts = async () => {
    try {
      const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api';
      const res = await fetch(`${base}/workouts`);
      if (!res.ok) return;
      const data: Workout[] = await res.json();
      setWorkouts(data);
      // Preserve existing state but initialize new workouts
      setFeedState((prevState) => {
        const newState = { ...prevState };
        data.forEach((w) => {
          // Only initialize if not already in state (preserves liked status)
          if (!newState[w._id]) {
            newState[w._id] = { likes: w.likes, liked: false };
          }
        });
        // Ensure demo post is in state, preserving existing state
        if (!newState[DEMO_WORKOUT._id]) {
          newState[DEMO_WORKOUT._id] = { likes: DEMO_WORKOUT.likes, liked: false };
        }
          if (!newState[DEMO_WORKOUT_LUCY._id]) {
            newState[DEMO_WORKOUT_LUCY._id] = { likes: DEMO_WORKOUT_LUCY.likes, liked: false };
          }
          if (!newState[DEMO_WORKOUT_SANDI._id]) {
            newState[DEMO_WORKOUT_SANDI._id] = { likes: DEMO_WORKOUT_SANDI.likes, liked: false };
          }
        return newState;
      });
    } catch (e) {
      // ignore network errors for now
    }
  };

  useEffect(() => {
    fetchWorkouts();
    const id = setInterval(fetchWorkouts, 5000);
    return () => clearInterval(id);
  }, []);

  // Prefill username/commenter from stored Account name on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('studentName');
        if (stored) {
          setUsername(stored);
          setCommentUsername(stored);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need permission to access your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const postWorkout = () => {
    if (!username.trim() || !calories.trim()) {
      Alert.alert('Error', 'Please enter username and calories');
      return;
    }

    const calorieNum = parseInt(calories, 10);
    if (isNaN(calorieNum) || calorieNum <= 0) {
      Alert.alert('Error', 'Please enter a valid calorie amount');
      return;
    }

    // Create new workout object
    const newWorkout: Workout = {
      _id: `${Date.now()}`,
      username: username.trim(),
      calories: calorieNum,
      date: new Date().toISOString(),
      likes: 0,
      imageUrl: photoUri || undefined,
    };

    // Add to feed immediately (at the beginning for newest first)
    setWorkouts([newWorkout, ...workouts]);
    setFeedState((prev) => ({ ...prev, [newWorkout._id]: { likes: 0, liked: false } }));
    // Persist username to storage for next time
    AsyncStorage.setItem('studentName', newWorkout.username).catch(() => {});
    
    // Reset form and close modal
    setUsername('');
    setCalories('');
    setPhotoUri(null);
    setShowModal(false);
  };

  // Open post modal and prefill username from Account storage
  const openPostModal = async () => {
    try {
      const stored = await AsyncStorage.getItem('studentName');
      if (stored) setUsername(stored);
    } catch (e) {
      // ignore
    }
    setShowModal(true);
  };

  // Helper to get the canonical likes count for a workout id
  const getLikesForId = (id: string) => {
    const found = workouts.find((w) => w._id === id);
    if (found) return found.likes ?? 0;
    if (id === DEMO_WORKOUT._id) return DEMO_WORKOUT.likes ?? 0;
    if (id === DEMO_WORKOUT_LUCY._id) return DEMO_WORKOUT_LUCY.likes ?? 0;
    if (id === DEMO_WORKOUT_SANDI._id) return DEMO_WORKOUT_SANDI.likes ?? 0;
    return 0;
  };

  const celebrateWorkout = (workoutId: string) => {
    // Use existing feedState if present, otherwise fall back to the workout's canonical likes
    const existing = feedState[workoutId] ?? { likes: getLikesForId(workoutId), liked: false };
    const isCelebrated = existing.liked;

    // Calculate new state (don't go below 0)
    const newLikes = isCelebrated ? Math.max(0, existing.likes - 1) : existing.likes + 1;

    const newState: WorkoutState = {
      likes: newLikes,
      liked: !isCelebrated,
    };

    // Update state immediately
    setFeedState((prev) => ({ ...prev, [workoutId]: newState }));

    // Persist the likes count into the workouts array for regular posts so
    // subsequent baseline reads reflect the change for all users.
    setWorkouts((prev) =>
      prev.map((w) => (w._id === workoutId ? { ...w, likes: newLikes } : w))
    );
  };

  const addComment = () => {
    if (!commentUsername.trim() || !commentText.trim()) {
      Alert.alert('Error', 'Please enter your name and comment');
      return;
    }

    if (!selectedWorkoutId) return;

    // Create new comment
    const newComment: Comment = {
      _id: `${Date.now()}`,
      username: commentUsername.trim(),
      text: commentText.trim(),
      likes: 0,
    };

    // Handle demo post separately
    if (selectedWorkoutId === 'demo-herbie') {
      setDemoComments([...demoComments, newComment]);
    } else {
      // Add comment to regular workout
      setWorkouts((prev) =>
        prev.map((w) =>
          w._id === selectedWorkoutId
            ? { ...w, comments: [...(w.comments || []), newComment] }
            : w
        )
      );
    }

    // Reset form
    setCommentText('');
    // persist commenter name
    AsyncStorage.setItem('studentName', newComment.username).catch(() => {});
    setCommentUsername('');
  };

  // Open comments modal and prefill commenter name from storage
  const openCommentsModal = async (workoutId: string) => {
    try {
      const stored = await AsyncStorage.getItem('studentName');
      if (stored) setCommentUsername(stored);
    } catch (e) {
      // ignore
    }
    setSelectedWorkoutId(workoutId);
    setShowCommentsModal(true);
  };

  const toggleCommentLike = (workoutId: string, commentId: string) => {
    const key = `${workoutId}-${commentId}`;
    const isLiked = commentLikes[key];

    // Handle demo post separately
    if (workoutId === 'demo-herbie') {
      setDemoComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 }
            : c
        )
      );
    } else {
      // Update the workout with the new comment likes
      setWorkouts((prev) =>
        prev.map((w) =>
          w._id === workoutId
            ? {
                ...w,
                comments: (w.comments || []).map((c) =>
                  c._id === commentId
                    ? { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 }
                    : c
                ),
              }
            : w
        )
      );
    }

    // Update like state
    setCommentLikes((prev) => ({
      ...prev,
      [key]: !isLiked,
    }));
  };

  const renderItem = ({ item }: { item: Workout }) => {
    const date = new Date(item.date);
    const itemState = feedState[item._id] || { likes: item.likes, liked: false };
    const likes = itemState.likes;
    const isCelebrated = itemState.liked;
    // For demo post, use demoComments state; for others, use item comments
    const comments = item._id === 'demo-herbie' ? demoComments : item.comments || [];
    return (
      <ThemedView style={styles.item}>
        {item.imageUrl && (
          <Image source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl} style={styles.workoutImage} />
        )}
        <ThemedText type="subtitle">{item.username} completed a workout!</ThemedText>
        <View style={styles.row}>
          <ThemedText>{item.calories} Calories</ThemedText>
          <ThemedText style={styles.date}>{date.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.celebrateBtn, isCelebrated && styles.celebrateBtnActive]}
            onPress={() => celebrateWorkout(item._id)}
          >
            <Heart
              size={18}
              color="#e80e0e"
              fill={isCelebrated ? '#e80e0e' : 'none'}
            />
            <ThemedText style={styles.celebrateText}>
              {isCelebrated ? 'Celebrated' : 'Celebrate'}
            </ThemedText>
            <ThemedText style={styles.likeCount}>{likes}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commentBtn}
            onPress={() => openCommentsModal(item._id)}
          >
            <MessageCircle size={18} color="#e80e0e" />
            <ThemedText style={styles.commentBtnText}>Comments</ThemedText>
            <ThemedText style={styles.commentCount}>{comments.length}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  const HeaderComponent = () => (
    <View style={[styles.headerContainer, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }]}>
        <Activity size={178} color="#e80e0e" style={styles.headerIcon} />
      </View>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Activity Feed</ThemedText>
      </ThemedView>
    </View>
  );

  return (
    <ThemedView style={{ flex: 1, position: 'relative' }}>
      <FlatList
          data={[...workouts, DEMO_WORKOUT, DEMO_WORKOUT_LUCY, DEMO_WORKOUT_SANDI]}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={<ThemedText style={styles.emptyText}>Users will share workouts and updates here.</ThemedText>}
        contentContainerStyle={workouts.length === 0 ? styles.emptyContainer : undefined}
      />

          <TouchableOpacity style={styles.fab} onPress={openPostModal}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Post Workout</ThemedText>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <ThemedText style={styles.closeBtn}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!posting}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Calories Burned</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter calories"
                placeholderTextColor="#999"
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
                editable={!posting}
              />
            </View>

            <ThemedText style={styles.label}>Photo (optional)</ThemedText>
            <TouchableOpacity style={styles.photoPickerBtn} onPress={pickImage}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.previewPhoto} />
              ) : (
                <View style={styles.photoPickerContent}>
                  <Camera size={32} color="#e80e0e" />
                  <ThemedText style={styles.photoPickerText}>Tap to add photo</ThemedText>
                </View>
              )}
            </TouchableOpacity>
            {photoUri && (
              <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.removePhotoBtn}>
                <ThemedText style={styles.removePhotoText}>Remove photo</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.postBtn, posting && styles.postBtnDisabled]}
              onPress={postWorkout}
              disabled={posting}
            >
              <ThemedText style={styles.postBtnText}>
                {posting ? 'Posting...' : 'Post Workout'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={showCommentsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <ThemedView style={styles.commentsModalOverlay}>
          <ThemedView style={styles.commentsModalContent}>
            <View style={styles.commentsModalHeader}>
              <ThemedText type="title">Comments</ThemedText>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <X size={24} color="#e80e0e" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList}>
              {selectedWorkoutId && (() => {
                // Get comments from either demo post or regular post
                const comments = selectedWorkoutId === 'demo-herbie' 
                  ? demoComments 
                  : workouts.find(w => w._id === selectedWorkoutId)?.comments || [];
                
                return comments.map((comment) => {
                  const key = `${selectedWorkoutId}-${comment._id}`;
                  const isLiked = commentLikes[key];
                  return (
                    <View key={comment._id} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <ThemedText style={styles.commentUsername}>{comment.username}</ThemedText>
                        <ThemedText style={styles.commentDate}>now</ThemedText>
                      </View>
                      <ThemedText style={styles.commentBody}>{comment.text}</ThemedText>
                      <TouchableOpacity
                        style={styles.commentLikeBtn}
                        onPress={() => toggleCommentLike(selectedWorkoutId, comment._id)}
                      >
                        <Heart
                          size={14}
                          color="#e80e0e"
                          fill={isLiked ? '#e80e0e' : 'none'}
                        />
                        <ThemedText style={styles.commentLikeText}>
                          {comment.likes}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  );
                });
              })()}
            </ScrollView>

            <View style={styles.commentInputSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Your name"
                placeholderTextColor="#999"
                value={commentUsername}
                onChangeText={setCommentUsername}
              />
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={styles.addCommentBtn}
                onPress={addComment}
              >
                <ThemedText style={styles.addCommentBtnText}>Post Comment</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 32,
    gap: 16,
  },
  header: {
    height: 250,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
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
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#e6e6e6',
    paddingHorizontal: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  date: {
    opacity: 0.7,
  },
  celebrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e80e0e',
    alignSelf: 'flex-start',
  },
  celebrateBtnActive: {
    backgroundColor: 'rgba(232, 14, 14, 0.1)',
  },
  workoutImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  celebrateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e80e0e',
  },
  emptyContainer: {
    paddingTop: 16,
  },
  emptyText: {
    padding: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e80e0e',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  photoPickerBtn: {
    borderWidth: 2,
    borderColor: '#e80e0e',
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPickerContent: {
    alignItems: 'center',
    gap: 12,
  },
  photoPickerText: {
    color: '#e80e0e',
    fontWeight: '600',
    fontSize: 14,
  },
  previewPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removePhotoBtn: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  removePhotoText: {
    color: '#e80e0e',
    fontSize: 12,
    fontWeight: '600',
  },
  postBtn: {
    backgroundColor: '#e80e0e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  postBtnDisabled: {
    opacity: 0.6,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e80e0e',
    alignSelf: 'flex-start',
  },
  commentBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e80e0e',
  },
  commentsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    gap: 8,
  },
  commentPreview: {
    paddingBottom: 8,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 2,
  },
  commentPreviewText: {
    fontSize: 13,
    opacity: 0.8,
  },
  commentsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  commentsModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  commentsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentsList: {
    marginBottom: 16,
    maxHeight: 300,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 13,
  },
  commentDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  commentBody: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  commentLikeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e80e0e',
  },
  commentInputSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e80e0e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#000',
    backgroundColor: '#fff',
  },
  addCommentBtn: {
    backgroundColor: '#e80e0e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addCommentBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});