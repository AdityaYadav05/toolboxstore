import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Star, Archive, Tag, Calendar, Clock, Save, X, Pin, MoreVertical, FileText } from 'lucide-react';

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'archived'
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample initial data
  const sampleNotes = [
    {
      id: 1,
      title: 'Welcome to Notes App',
      content: 'This is your first note! You can edit, delete, or favorite notes. Use categories to organize your thoughts.',
      category: 'personal',
      isFavorite: true,
      isArchived: false,
      isPinned: true,
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      color: 'blue'
    },
    {
      id: 2,
      title: 'Meeting Notes',
      content: 'Project discussion:\n- Timeline review\n- Resource allocation\n- Next milestones\n- Action items',
      category: 'work',
      isFavorite: false,
      isArchived: false,
      isPinned: false,
      createdAt: new Date('2024-01-16T14:20:00'),
      updatedAt: new Date('2024-01-16T14:20:00'),
      color: 'green'
    },
    {
      id: 3,
      title: 'Shopping List',
      content: 'Groceries needed:\n• Milk\n• Eggs\n• Bread\n• Fruits\n• Vegetables',
      category: 'personal',
      isFavorite: false,
      isArchived: false,
      isPinned: false,
      createdAt: new Date('2024-01-17T09:15:00'),
      updatedAt: new Date('2024-01-17T09:15:00'),
      color: 'orange'
    },
    {
      id: 4,
      title: 'Book Ideas',
      content: 'Potential book topics:\n1. Modern web development\n2. AI and machine learning\n3. Digital productivity\n4. Creative coding',
      category: 'ideas',
      isFavorite: true,
      isArchived: false,
      isPinned: false,
      createdAt: new Date('2024-01-18T16:45:00'),
      updatedAt: new Date('2024-01-18T16:45:00'),
      color: 'purple'
    }
  ];

  const sampleCategories = [
    { id: 'personal', name: 'Personal', color: 'blue' },
    { id: 'work', name: 'Work', color: 'green' },
    { id: 'ideas', name: 'Ideas', color: 'purple' },
    { id: 'study', name: 'Study', color: 'orange' },
    { id: 'projects', name: 'Projects', color: 'red' }
  ];

  // Initialize data
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedCategories = localStorage.getItem('categories');

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes(sampleNotes);
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(sampleCategories);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [notes, categories]);

  // Create new note
  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: 'Start writing...',
      category: 'personal',
      isFavorite: false,
      isArchived: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      color: getRandomColor()
    };

    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  // Save note
  const saveNote = () => {
    if (!activeNote) return;

    const updatedNote = {
      ...activeNote,
      title: editTitle,
      content: editContent,
      updatedAt: new Date()
    };

    setNotes(prev => prev.map(note => 
      note.id === activeNote.id ? updatedNote : note
    ));
    setActiveNote(updatedNote);
    setIsEditing(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle(activeNote?.title || '');
    setEditContent(activeNote?.content || '');
  };

  // Delete note
  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (activeNote?.id === noteId) {
      setActiveNote(null);
      setIsEditing(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = (noteId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  // Toggle archive
  const toggleArchive = (noteId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isArchived: !note.isArchived } : note
    ));
  };

  // Toggle pin
  const togglePin = (noteId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  // Change category
  const changeCategory = (noteId, categoryId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, category: categoryId } : note
    ));
  };

  // Start editing
  const startEditing = (note) => {
    setActiveNote(note);
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // Select note
  const selectNote = (note) => {
    setActiveNote(note);
    setIsEditing(false);
  };

  // Get filtered notes
  const getFilteredNotes = () => {
    let filtered = notes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'favorites') {
      filtered = filtered.filter(note => note.isFavorite);
    } else if (filter === 'archived') {
      filtered = filtered.filter(note => note.isArchived);
    } else {
      filtered = filtered.filter(note => !note.isArchived);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // Sort: pinned first, then by updated date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  };

  // Get random color
  const getRandomColor = () => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get color classes
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-500 border-blue-500 text-blue-600',
      green: 'bg-green-500 border-green-500 text-green-600',
      purple: 'bg-purple-500 border-purple-500 text-purple-600',
      orange: 'bg-orange-500 border-orange-500 text-orange-600',
      red: 'bg-red-500 border-red-500 text-red-600',
      pink: 'bg-pink-500 border-pink-500 text-pink-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  };

  // Add new category
  const addCategory = () => {
    const newCategory = {
      id: `category-${Date.now()}`,
      name: 'New Category',
      color: getRandomColor()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'blue';
  };

  // Word count
  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Character count
  const getCharCount = (text) => {
    return text.length;
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Notes App</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* New Note Button */}
          <button
            onClick={createNewNote}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            New Note
          </button>

          {/* Search */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Filters</h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => setFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  filter === 'all' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                All Notes ({notes.filter(n => !n.isArchived).length})
              </button>
              <button
                onClick={() => setFilter('favorites')}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  filter === 'favorites' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Star size={16} />
                  Favorites ({notes.filter(n => n.isFavorite && !n.isArchived).length})
                </span>
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  filter === 'archived' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Archive size={16} />
                  Archived ({notes.filter(n => n.isArchived).length})
                </span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Categories</h3>
              <button
                onClick={addCategory}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="p-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  selectedCategory === 'all' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                    selectedCategory === category.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${getColorClasses(category.color).split(' ')[0]}`}></div>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Notes:</span>
                <span className="font-semibold">{notes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Favorites:</span>
                <span className="font-semibold">{notes.filter(n => n.isFavorite).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pinned:</span>
                <span className="font-semibold">{notes.filter(n => n.isPinned).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Archived:</span>
                <span className="font-semibold">{notes.filter(n => n.isArchived).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Notes List */}
            <div className="xl:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-xl">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">
                    {filteredNotes.length} Note{filteredNotes.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                      <div className="text-gray-500">No notes found</div>
                    </div>
                  ) : (
                    filteredNotes.map(note => (
                      <div
                        key={note.id}
                        onClick={() => selectNote(note)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                          activeNote?.id === note.id 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {note.isPinned && <Pin size={14} className="text-blue-500" />}
                            <h4 className="font-semibold text-gray-800 truncate flex-1">
                              {note.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {note.isFavorite && (
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {note.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full ${getColorClasses(getCategoryColor(note.category)).split(' ')[2]}`}>
                              {getCategoryName(note.category)}
                            </span>
                          </div>
                          <span>{formatDate(note.updatedAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Note Editor/Viewer */}
            <div className="xl:col-span-2">
              {activeNote ? (
                <div className="bg-white border-2 border-gray-200 rounded-xl h-full">
                  {isEditing ? (
                    /* Edit Mode */
                    <div className="h-full flex flex-col">
                      <div className="p-6 border-b border-gray-200">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-2xl font-bold border-none outline-none focus:ring-0"
                          placeholder="Note title"
                        />
                      </div>
                      
                      <div className="flex-1 p-6">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-64 border-none outline-none focus:ring-0 resize-none"
                          placeholder="Start writing your note..."
                        />
                      </div>

                      <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {getWordCount(editContent)} words • {getCharCount(editContent)} characters
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                            >
                              <X size={16} className="inline mr-2" />
                              Cancel
                            </button>
                            <button
                              onClick={saveNote}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                              <Save size={16} className="inline mr-2" />
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="h-full flex flex-col">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <h2 className="text-2xl font-bold text-gray-800">{activeNote.title}</h2>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFavorite(activeNote.id)}
                              className={`p-2 rounded-lg transition ${
                                activeNote.isFavorite 
                                  ? 'text-yellow-500 bg-yellow-50' 
                                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                              }`}
                            >
                              <Star size={18} className={activeNote.isFavorite ? 'fill-current' : ''} />
                            </button>
                            <button
                              onClick={() => togglePin(activeNote.id)}
                              className={`p-2 rounded-lg transition ${
                                activeNote.isPinned 
                                  ? 'text-blue-500 bg-blue-50' 
                                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                              }`}
                            >
                              <Pin size={18} />
                            </button>
                            <button
                              onClick={() => startEditing(activeNote)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => deleteNote(activeNote.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Created: {formatDate(activeNote.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Updated: {formatDate(activeNote.updatedAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${getColorClasses(getCategoryColor(activeNote.category)).split(' ')[2]}`}>
                            {getCategoryName(activeNote.category)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-6">
                        <div className="prose max-w-none">
                          {activeNote.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 text-gray-700">
                              {paragraph || <br />}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {getWordCount(activeNote.content)} words • {getCharCount(activeNote.content)} characters
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleArchive(activeNote.id)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                            >
                              <Archive size={16} className="inline mr-2" />
                              {activeNote.isArchived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button
                              onClick={() => startEditing(activeNote)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                              <Edit3 size={16} className="inline mr-2" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-white border-2 border-gray-200 rounded-xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Note Selected</h3>
                    <p className="text-gray-500 mb-4">Select a note from the list or create a new one</p>
                    <button
                      onClick={createNewNote}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus size={20} className="inline mr-2" />
                      Create New Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Note Taking Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use categories to organize your notes by topic or project</li>
          <li>• Pin important notes to keep them at the top of your list</li>
          <li>• Favorite frequently accessed notes for quick retrieval</li>
          <li>• Archive old notes you want to keep but don't need regularly</li>
          <li>• Use the search function to quickly find notes by content or title</li>
        </ul>
      </div>
    </div>
  );
};

export default NotesApp;
