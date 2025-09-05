import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronDown, ExternalLink, Database, ChevronUp, FileText, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Mail, Building, Tag, Layers, Calendar } from 'lucide-react';

const SIH_PS_SITE = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [datasetFilter, setDatasetFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load JSON data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate loading from local JSON file
        const jsonData = await import('./data/sih_problems.json');
        setData(Array.isArray(jsonData.default) ? jsonData.default : []);
        setSelectedCategory("Software");
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data if JSON file is not found
        const sampleData = Array.from({ length: 25 }, (_, i) => ({
          "id": `2500${i + 1}`,
          "title": `Smart Community Health Monitoring System ${i + 1}`,
          "description": `Problem Statement\n\nThis problem statement proposes the development of a Smart Health Surveillance and Early Warning System that can detect, monitor, and help prevent outbreaks of water-borne diseases in vulnerable communities.\n\nThe system will use IoT sensors, machine learning algorithms, and real-time data analytics to provide early warnings and actionable insights for health officials and community leaders.\n\nKey Features:\n• Real-time monitoring of water quality parameters\n• Predictive analytics for disease outbreak prediction\n• Mobile alerts for community members\n• Dashboard for health officials\n• Integration with existing health infrastructure\n\nExpected Deliverables:\n1. Functional prototype of the monitoring system\n2. Mobile application for community engagement\n3. Web dashboard for health officials\n4. Documentation and user manuals\n5. Deployment guide and training materials`,
          "organization": i % 3 === 0 ? "Ministry of Development of North Eastern Region" : i % 3 === 1 ? "Department of Science & Technology" : "Ministry of Electronics & IT",
          "department": i % 3 === 0 ? "Ministry of Health & Family Welfare" : i % 3 === 1 ? "Ministry of Education" : "Ministry of Tourism",
          "category": i % 2 === 0 ? "Software" : "Hardware",
          "theme": i % 4 === 0 ? "MedTech / BioTech / HealthTech" : i % 4 === 1 ? "Travel & Tourism" : i % 4 === 2 ? "Smart Education" : "Agriculture, FoodTech & Rural Development",
          "youtube_link": i % 3 === 0 ? "https://youtube.com/watch?v=example" : "",
          "dataset_link": i % 2 === 0 ? "https://data.gov.in/example-dataset" : "",
          "contact_info": `contact${i + 1}@example.com`
        }));
        setData(sampleData);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTheme, datasetFilter]);

  // Extract unique values for filters
  const categories = useMemo(() => {
    return [...new Set(data.map(item => item.category).filter(Boolean))].sort();
  }, [data]);

  const themes = useMemo(() => {
    return [...new Set(data.map(item => item.theme).filter(Boolean))].sort();
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesTheme = !selectedTheme || item.theme === selectedTheme;
      
      const hasDataset = item.dataset_link && item.dataset_link.trim() !== '';
      const matchesDatasetFilter = 
        datasetFilter === '' || 
        (datasetFilter === 'with-dataset' && hasDataset) ||
        (datasetFilter === 'without-dataset' && !hasDataset);

      return matchesSearch && matchesCategory && matchesTheme && matchesDatasetFilter;
    });
  }, [data, searchTerm, selectedCategory, selectedTheme, datasetFilter]);

  // Sort and paginate data
  const paginatedData = useMemo(() => {
    let sorted = [...filteredData];

    if (sortColumn) {
      sorted.sort((a, b) => {
        let aVal = a[sortColumn] || '';
        let bVal = b[sortColumn] || '';
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return sorted.slice(startIndex, endIndex);
  }, [filteredData, sortColumn, sortDirection, currentPage, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTheme('');
    setDatasetFilter('');
    setSortColumn('');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const openModal = (problem) => {
    setSelectedProblem(problem);
    setShowModal(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProblem(null);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const PaginationButton = ({ page, isActive, onClick, disabled, children }) => (
    <button
      onClick={() => onClick(page)}
      disabled={disabled}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  // Modal Component
  const Modal = ({ problem, onClose }) => {
    if (!problem) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

          {/* Modal content */}
          <div 
            className="inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold">
                    {problem.id}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {problem.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {problem.title}
                </h2>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{problem.organization}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-4 h-4" />
                    <span>{problem.theme}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Problem Description
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 leading-relaxed whitespace-pre-line">
                      {problem.description}
                    </div>
                  </div>
                </div>

                {/* Sidebar with Details */}
                <div className="space-y-6">
                  {/* Organization Details */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Organization
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Ministry:</span>
                        <p className="text-blue-700">{problem.organization}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Department:</span>
                        <p className="text-blue-700">{problem.department}</p>
                      </div>
                    </div>
                  </div>

                  {/* Theme & Category */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Classification
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-green-800">THEME</span>
                        <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mt-1">
                          {problem.theme}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-800">CATEGORY</span>
                        <div className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full mt-1">
                          {problem.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  {problem.contact_info && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact
                      </h4>
                      <div className="text-sm text-orange-800">
                        {problem.contact_info}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="space-y-3">
                    {problem.dataset_link && problem.dataset_link.trim() && (
                      <a
                        href={problem.dataset_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group"
                      >
                        <Database className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Access Dataset</div>
                          <div className="text-sm text-blue-200">View related data</div>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                    
                    {problem.youtube_link && problem.youtube_link.trim() && (
                      <a
                        href={problem.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors group"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Watch Video</div>
                          <div className="text-sm text-red-200">Learn more about this problem</div>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading problem statements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Problem Statements Dashboard</h1>
          <p className="text-gray-600 text-lg">Explore and filter through problem statements with advanced search capabilities</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, description, organization..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCategory || selectedTheme || datasetFilter) && (
                <span className="bg-blue-800 text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {[selectedCategory, selectedTheme, datasetFilter].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                  >
                    <option value="">All Themes</option>
                    {themes.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dataset</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    value={datasetFilter}
                    onChange={(e) => setDatasetFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="with-dataset">With Dataset</option>
                    <option value="without-dataset">Without Dataset</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count and Page Size Selector */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredData.length > 0 ? startItem : 0}-{endItem}</span> of{' '}
              <span className="font-semibold text-gray-900">{filteredData.length}</span> problem statements
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 w-20">
                    <span className="font-semibold text-gray-900">Actions</span>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      ID <SortIcon column="id" />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      Title <SortIcon column="title" />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('organization')}
                      className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      Organization <SortIcon column="organization" />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      Category <SortIcon column="category" />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('theme')}
                      className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      Theme <SortIcon column="theme" />
                    </button>
                  </th>
                  <th className="text-left p-4">Links</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="p-4">
                      <button
                        onClick={() => openModal(item)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-semibold">
                        {item.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="max-w-md">
                        <h3 className="font-semibold text-gray-900 mb-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => openModal(item)}>
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description.split('\n')[0].replace('Problem Statement', '').trim()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900 mb-1">{item.organization}</div>
                        <div className="text-gray-600 text-xs line-clamp-2">{item.department}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full max-w-[120px] truncate" title={item.theme}>
                        {item.theme}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {item.dataset_link && item.dataset_link.trim() && (
                          <a
                            href={item.dataset_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-3 py-1 rounded-full transition-colors font-medium"
                            title="Dataset Link"
                          >
                            <Database className="w-3 h-3" />
                            Dataset
                          </a>
                        )}
                        {item.youtube_link && item.youtube_link.trim() && (
                          <a
                            href={item.youtube_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs bg-red-50 px-3 py-1 rounded-full transition-colors font-medium"
                            title="YouTube Link"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Video
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No problem statements found</h3>
              <p className="text-gray-600 mb-6 text-lg">Try adjusting your search criteria or filters</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <PaginationButton
                  page={1}
                  onClick={handlePageChange}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </PaginationButton>
                
                <PaginationButton
                  page={currentPage - 1}
                  onClick={handlePageChange}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </PaginationButton>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, currentPage - 2);
                  const page = startPage + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <PaginationButton
                      key={page}
                      page={page}
                      isActive={page === currentPage}
                      onClick={handlePageChange}
                    >
                      {page}
                    </PaginationButton>
                  );
                })}

                <PaginationButton
                  page={currentPage + 1}
                  onClick={handlePageChange}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </PaginationButton>
                
                <PaginationButton
                  page={totalPages}
                  onClick={handlePageChange}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </PaginationButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <Modal problem={selectedProblem} onClose={closeModal} />}
      </div>
  );
}

export default SIH_PS_SITE;