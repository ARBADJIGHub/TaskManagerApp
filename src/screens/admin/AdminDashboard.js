import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  useTheme,
  Appbar,
  DataTable,
  Searchbar,
  IconButton,
} from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

export default function AdminDashboard({ navigation }) {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (!userInfo?.isAdmin) {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les droits d\'administrateur');
      navigation.goBack();
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/stats')
      ]);
      
      setUsers(usersResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      Alert.alert('Succès', 'Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Tableau de bord administrateur" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title>Utilisateurs</Title>
              <Paragraph>Total: {stats.totalUsers}</Paragraph>
              <Paragraph>Actifs: {stats.activeUsers}</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Title>Tâches</Title>
              <Paragraph>Total: {stats.totalTasks}</Paragraph>
              <Paragraph>Complétées: {stats.completedTasks}</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Liste des utilisateurs */}
        <Card style={styles.usersCard}>
          <Card.Content>
            <Title>Gestion des utilisateurs</Title>
            <Searchbar
              placeholder="Rechercher un utilisateur"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Utilisateur</DataTable.Title>
                <DataTable.Title>Email</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredUsers.map((user) => (
                <DataTable.Row key={user.id}>
                  <DataTable.Cell>{user.username}</DataTable.Cell>
                  <DataTable.Cell>{user.email}</DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => navigation.navigate('EditUser', { userId: user.id })}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => {
                        Alert.alert(
                          'Confirmation',
                          'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
                          [
                            { text: 'Annuler', style: 'cancel' },
                            { text: 'Supprimer', onPress: () => handleDeleteUser(user.id) }
                          ]
                        );
                      }}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 8,
  },
  usersCard: {
    marginBottom: 16,
  },
  searchBar: {
    marginVertical: 8,
  },
}); 