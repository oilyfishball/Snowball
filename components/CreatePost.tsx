import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.username) setUsername(data.username);
          });
      }
    });
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, userId: string): Promise<string | null> => {
    const ext = uri.split('.').pop() ?? 'jpg';
    const fileName = `${userId}/${Date.now()}.${ext}`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error } = await supabase.storage
      .from('post-images')
      .upload(fileName, arrayBuffer, { contentType: `image/${ext}` });

    if (error) {
      console.error('Upload error:', error.message);
      return null;
    }
    const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required.');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }

    let imageUrl: string | null = null;
    if (image) {
      imageUrl = await uploadImage(image, user.id);
      if (!imageUrl) {
        setLoading(false);
        Alert.alert('Error', 'Failed to upload image.');
        return;
      }
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setTitle('');
      setDescription('');
      setImage(null);
      Alert.alert('Success', 'Post created!');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>
          Hello {username}!{'\n'}
          <Text style={styles.subheading}>What's on your mind?</Text>
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          maxLength={25}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add more details..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Image (optional)</Text>
        <TouchableOpacity style={image ? styles.imagePickerWithImage : styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="contain" />
          ) : (
            <Text style={styles.imagePickerText}>Tap to select an image</Text>
          )}
        </TouchableOpacity>
        {image && (
          <TouchableOpacity onPress={() => setImage(null)}>
            <Text style={styles.removeImage}>Remove image</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handlePost} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Post</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f0eef6',
    marginBottom: 30,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 23,
    fontWeight: '400',
    color: '#8b8b9e',
  },
  label: {
    fontSize: 14,
    color: '#8b8b9e',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f0eef6',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d2b3d',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imagePicker: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d2b3d',
  },
  imagePickerWithImage: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d2b3d',
  },
  imagePickerText: {
    color: '#6b6b80',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    aspectRatio: undefined,
    minHeight: 150,
    maxHeight: 400,
    borderRadius: 12,
  },
  removeImage: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
});
