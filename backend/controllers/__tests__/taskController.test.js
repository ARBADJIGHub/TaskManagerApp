const {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  shareTask,
  getSharedWithMe,
  getSharedByMe,
} = require('../taskController.js');
const pool = require('../../config/db.js');

// Mock de la connexion à la base de données
jest.mock('../../config/db.js', () => ({
  query: jest.fn(),
}));

describe('Task Controller', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('devrait récupérer toutes les tâches de l\'utilisateur', async () => {
      const mockTasks = [
        { id: 1, title: 'Tâche 1' },
        { id: 2, title: 'Tâche 2' },
      ];
      const mockReq = { user: { id: 1 } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([mockTasks]);

      await getAllTasks(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
        [1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    it('devrait gérer les erreurs lors de la récupération des tâches', async () => {
      const mockReq = { user: { id: 1 } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockRejectedValueOnce(new Error('Erreur DB'));

      await getAllTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Erreur serveur lors de la récupération des tâches.',
      });
    });
  });

  describe('createTask', () => {
    it('devrait créer une nouvelle tâche', async () => {
      const mockTask = {
        title: 'Nouvelle tâche',
        description: 'Description',
        due_date: '2024-12-31',
      };
      const mockReq = {
        user: { id: 1 },
        body: mockTask,
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      await createTask(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO tasks (title, description, due_date, user_id) VALUES (?, ?, ?, ?)',
        [mockTask.title, mockTask.description, mockTask.due_date, 1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche créée avec succès',
        taskId: 1,
      });
    });

    it('devrait retourner une erreur si le titre est manquant', async () => {
      const mockReq = {
        user: { id: 1 },
        body: { description: 'Description' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Le titre de la tâche est requis.',
      });
    });
  });

  describe('getTaskById', () => {
    it('devrait récupérer une tâche par son ID', async () => {
      const mockTask = {
        id: 1,
        title: 'Tâche test',
        user_id: 1,
        owner_username: 'testuser',
      };
      const mockShares = [
        { shared_with: 2, recipient_username: 'user2' },
      ];
      const mockReq = {
        params: { id: 1 },
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query
        .mockResolvedValueOnce([[mockTask]])
        .mockResolvedValueOnce([mockShares]);

      await getTaskById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        title: 'Tâche test',
        sharingInfo: expect.any(Object),
      }));
    });

    it('devrait retourner 404 si la tâche n\'existe pas', async () => {
      const mockReq = {
        params: { id: 999 },
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([[]]);

      await getTaskById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche non trouvée.',
      });
    });
  });

  describe('updateTask', () => {
    it('devrait mettre à jour une tâche existante', async () => {
      const mockTask = {
        title: 'Tâche mise à jour',
        description: 'Nouvelle description',
        due_date: '2024-12-31',
      };
      const mockReq = {
        params: { id: 1 },
        user: { id: 1 },
        body: mockTask,
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await updateTask(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ? AND user_id = ?',
        [mockTask.title, mockTask.description, mockTask.due_date, 1, 1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche mise à jour avec succès',
      });
    });

    it('devrait retourner 404 si la tâche n\'existe pas ou n\'appartient pas à l\'utilisateur', async () => {
      const mockReq = {
        params: { id: 999 },
        user: { id: 1 },
        body: { title: 'Tâche inexistante' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      await updateTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche non trouvée ou accès refusé pour la modification.',
      });
    });
  });

  describe('deleteTask', () => {
    it('devrait supprimer une tâche existante', async () => {
      const mockReq = {
        params: { id: 1 },
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await deleteTask(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [1, 1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche supprimée avec succès',
      });
    });

    it('devrait retourner 404 si la tâche n\'existe pas ou n\'appartient pas à l\'utilisateur', async () => {
      const mockReq = {
        params: { id: 999 },
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      await deleteTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche non trouvée ou accès refusé pour la suppression.',
      });
    });
  });

  describe('completeTask', () => {
    it('devrait marquer une tâche comme terminée', async () => {
      const mockReq = {
        params: { id: 1 },
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await completeTask(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE tasks SET status = "completed" WHERE id = ? AND user_id = ?',
        [1, 1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche marquée comme terminée',
      });
    });

    it('devrait retourner 404 si la tâche n\'existe pas ou n\'appartient pas à l\'utilisateur', async () => {
      const mockReq = {
        params: { id: 999 },
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      await completeTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche non trouvée ou accès refusé pour la complétion.',
      });
    });
  });

  describe('shareTask', () => {
    it('devrait partager une tâche avec un autre utilisateur', async () => {
      const mockReq = {
        params: { id: 1 },
        user: { id: 1 },
        body: { sharedWith: 2 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      await shareTask(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO shared_items (item_type, item_id, shared_by, shared_with) VALUES (?, ?, ?, ?)',
        ['task', 1, 1, 2]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tâche partagée avec succès',
        shareId: 1,
      });
    });

    it('devrait retourner 400 si l\'ID de l\'utilisateur destinataire est manquant', async () => {
      const mockReq = {
        params: { id: 1 },
        user: { id: 1 },
        body: {},
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await shareTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'L\'ID de l\'utilisateur destinataire (\'sharedWith\') est requis.',
      });
    });

    it('devrait gérer l\'erreur si l\'utilisateur destinataire n\'existe pas', async () => {
      const mockReq = {
        params: { id: 1 },
        user: { id: 1 },
        body: { sharedWith: 999 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockRejectedValueOnce({ code: 'ER_NO_REFERENCED_ROW_2' });

      await shareTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'L\'utilisateur destinataire n\'existe pas.',
      });
    });
  });

  describe('getSharedWithMe', () => {
    it('devrait récupérer les tâches partagées avec l\'utilisateur', async () => {
      const mockSharedTasks = [
        { id: 1, title: 'Tâche partagée 1', username: 'user1' },
        { id: 2, title: 'Tâche partagée 2', username: 'user2' },
      ];
      const mockReq = {
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([mockSharedTasks]);

      await getSharedWithMe(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT t.id, t.created_at, u_sharer.username'),
        [1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSharedTasks);
    });
  });

  describe('getSharedByMe', () => {
    it('devrait récupérer les tâches partagées par l\'utilisateur', async () => {
      const mockSharedTasks = [
        { id: 1, title: 'Tâche partagée 1', shared_with_username: 'user1' },
        { id: 2, title: 'Tâche partagée 2', shared_with_username: 'user2' },
      ];
      const mockReq = {
        user: { id: 1 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce([mockSharedTasks]);

      await getSharedByMe(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT t.*, u_recipient.username as shared_with_username'),
        [1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSharedTasks);
    });
  });
}); 