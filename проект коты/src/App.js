import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Загрузка избранного из localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('catFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Сохранение избранного в localStorage
  useEffect(() => {
    localStorage.setItem('catFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Функция поиска картинок
  const searchImages = async () => {
    if (!searchTerm.trim()) {
      setError('Введите запрос для поиска');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Используем API The Cat API (бесплатный, не требует ключа)
      const response = await fetch(
        `https://api.thecatapi.com/v1/images/search?limit=20&breed_ids=${searchTerm}`
      );
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке картинок');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setError('Картинки по вашему запросу не найдены. Попробуйте другой запрос.');
      }
      
      setImages(data);
    } catch (err) {
      setError('Произошла ошибка при загрузке картинок. Попробуйте еще раз.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для загрузки случайных котиков
  const loadRandomCats = async () => {
    setLoading(true);
    setError('');
    setSearchTerm('');

    try {
      const response = await fetch(
        'https://api.thecatapi.com/v1/images/search?limit=20'
      );
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке картинок');
      }
      
      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError('Произошла ошибка при загрузке картинок');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Добавление/удаление из избранного
  const toggleFavorite = (image) => {
    const isFavorite = favorites.find(fav => fav.id === image.id);
    
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== image.id));
    } else {
      setFavorites([...favorites, { ...image, addedAt: new Date().toISOString() }]);
    }
  };

  // Проверка, находится ли изображение в избранном
  const isFavorite = (imageId) => {
    return favorites.some(fav => fav.id === imageId);
  };

  // Загрузка случайных котиков при первом рендере
  useEffect(() => {
    loadRandomCats();
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>🐱 Поиск картинок с котиками</h1>
        <p>Найдите самых милых котиков!</p>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Введите породу котика (например: beng, pers, siam)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchImages()}
          className="search-input"
        />
        <button 
          onClick={searchImages}
          disabled={loading}
          className="search-btn"
        >
          {loading ? 'Поиск...' : 'Найти котиков'}
        </button>
        <button 
          onClick={loadRandomCats}
          disabled={loading}
          className="search-btn"
        >
          Случайные котики
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="loading">Загружаем котиков... 🐾</div>}

      {!loading && images.length > 0 && (
        <div className="images-section">
          <h2 className="section-title">Найденные котики ({images.length})</h2>
          <div className="images-grid">
            {images.map((image) => (
              <div key={image.id} className="image-card">
                <img 
                  src={image.url} 
                  alt="Котик" 
                  onClick={() => window.open(image.url, '_blank')}
                />
                <div className="image-info">
                  <button 
                    onClick={() => toggleFavorite(image)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer'
                    }}
                  >
                    {isFavorite(image.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="favorites-section">
          <h2 className="section-title">Любимые котики ({favorites.length})</h2>
          <div className="images-grid">
            {favorites.map((image) => (
              <div key={image.id} className="image-card">
                <img 
                  src={image.url} 
                  alt="Любимый котик" 
                  onClick={() => window.open(image.url, '_blank')}
                />
                <div className="image-info">
                  <button 
                    onClick={() => toggleFavorite(image)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer'
                    }}
                  >
                    ❤️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && images.length === 0 && favorites.length === 0 && !error && (
        <div className="no-results">
          <p>Начните поиск, чтобы найти милых котиков!</p>
        </div>
      )}
    </div>
  );
}

export default App;