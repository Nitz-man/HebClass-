import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWord, deleteWord, getWords } from '../utils/api';
import '../styles/AdminWordBank.css';

function AdminWordBank() {
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newDifficulty, setNewDifficulty] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const data = await getWords();
      setWords(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching words:', error);
      setLoading(false);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    
    if (!newWord.trim() || !newTranslation.trim()) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      const data = await addWord(newWord, newTranslation, parseInt(newDifficulty));
      setWords([...words, data]);
      setNewWord('');
      setNewTranslation('');
      setNewDifficulty(1);
      setMessage('✓ Word added successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error adding word:', error);
      setMessage('Error adding word');
    }
  };

  const handleDeleteWord = async (wordId) => {
    const wordToRemove = words.find(word => word.id === wordId);
    const confirmed = window.confirm(`Remove "${wordToRemove?.translation || 'this word'}" from the word bank?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteWord(wordId);
      setWords(words.filter(word => word.id !== wordId));
      setMessage('Word removed successfully.');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error deleting word:', error);
      setMessage('Error removing word');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-words-container">
      <header className="admin-header">
        <h1>📚 Word Bank</h1>
        <button className="button button-secondary" onClick={() => navigate('/admin')}>
          Back
        </button>
      </header>

      {message && <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>{message}</div>}

      <div className="add-word-section">
        <h2>Add New Word</h2>
        <form onSubmit={handleAddWord} className="add-word-form">
          <div className="form-row">
            <div className="form-group">
              <label>Hebrew Word</label>
              <input
                type="text"
                className="input-field"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Enter Hebrew word"
                dir="rtl"
              />
            </div>

            <div className="form-group">
              <label>English Translation</label>
              <input
                type="text"
                className="input-field"
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.target.value)}
                placeholder="Enter English translation"
              />
            </div>

            <div className="form-group">
              <label>Difficulty (1-5)</label>
              <select
                className="input-field"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="button button-primary">
            Add Word
          </button>
        </form>
      </div>

      <div className="words-list-section">
        <h2>Word Bank ({words.length} words)</h2>
        <div className="words-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hebrew Word</th>
                <th>English</th>
                <th>Difficulty</th>
                <th>Length</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {words.map(word => (
                <tr key={word.id}>
                  <td>{word.id}</td>
                  <td className="hebrew">{word.word}</td>
                  <td>{word.translation}</td>
                  <td>
                    <span className={`difficulty difficulty-${word.difficulty}`}>
                      {'⭐'.repeat(word.difficulty)}
                    </span>
                  </td>
                  <td>{word.length}</td>
                  <td>
                    <button
                      type="button"
                      className="delete-word-button"
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminWordBank;
