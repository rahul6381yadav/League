import { useState, useEffect } from 'react';

const Contest = () => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [filters, setFilters] = useState({
    critical: true,
    warning: true,
    info: true
  });
  const [userFilter, setUserFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [groupByUser, setGroupByUser] = useState(true);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message)
      setMessages(prev => [{ ...message, timestamp: Date.now() }, ...prev.slice(0, 49)]);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  // Helper functions
  const getStatusClasses = (msg) => {
    const status = msg.status || 'info';
    return {
      'critical': 'border-red-500 bg-red-50',
      'warning': 'border-yellow-500 bg-yellow-50',
      'info': 'border-blue-500 bg-blue-50',
    }[status];
  };

  const getStatusBadgeClasses = (msg) => {
    const status = msg.status || 'info';
    return {
      'critical': 'bg-red-500 text-red-900',
      'warning': 'bg-yellow-500 text-yellow-900',
      'info': 'bg-blue-500 text-blue-900',
    }[status];
  };

  const renderActivityContent = (msg) => {
    switch(msg.type) {
      case 'join_room':
        return (
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Joined the room</span>
          </div>
        );

      case 'leave_room':
        return (
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Left the room</span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span className="text-gray-800">{msg.message}</span>
          </div>
        );
    }
  };

  // Filter messages based on filters
  const filteredMessages = messages.filter(msg => {
    const status = msg.status || 'info';
    if (!filters[status]) return false;
    
    // Filter by user (name or roll number)
    if (userFilter && !msg.name?.toLowerCase().includes(userFilter.toLowerCase()) && 
        !msg.rollNumber?.toLowerCase().includes(userFilter.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (sortBy === 'timestamp') return b.timestamp - a.timestamp;
    if (sortBy === 'status') {
      const statusPriority = { 'critical': 0, 'warning': 1, 'info': 2 };
      return statusPriority[a.status || 'info'] - statusPriority[b.status || 'info'];
    }
    if (sortBy === 'user') return a.name?.localeCompare(b.name || '');
    return 0;
  });

  // Group messages by user if enabled
  const groupedMessages = {};
  if (groupByUser) {
    sortedMessages.forEach(msg => {
      const key = msg.rollNumber || 'unknown';
      if (!groupedMessages[key]) {
        groupedMessages[key] = {
          user: { name: msg.name, rollNumber: msg.rollNumber },
          messages: []
        };
      }
      groupedMessages[key].messages.push(msg);
    });
  }

  // Unique users for stats
  const uniqueUsers = new Set(messages.map(m => m.rollNumber)).size;
  const activeRooms = new Set(messages.map(m => m.roomCode)).size;

  return (
    <div className="p-5 max-w-6xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Activity Monitor</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="bg-blue-100 px-3 py-1 rounded-full">
            Total Messages: {messages.length}
          </div>
          <div className="bg-green-100 px-3 py-1 rounded-full">
            Active Rooms: {activeRooms}
          </div>
          <div className="bg-purple-100 px-3 py-1 rounded-full">
            Unique Users: {uniqueUsers}
          </div>
        </div>
      </div>

      {/* Controls and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Name or Roll Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="timestamp">Most Recent</option>
              <option value="status">Priority (Critical First)</option>
              <option value="user">User Name</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={filters.critical} 
                onChange={() => setFilters({...filters, critical: !filters.critical})}
                className="accent-red-500" 
              />
              <span className="text-sm text-gray-700">Critical</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={filters.warning} 
                onChange={() => setFilters({...filters, warning: !filters.warning})}
                className="accent-yellow-500" 
              />
              <span className="text-sm text-gray-700">Warnings</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={filters.info} 
                onChange={() => setFilters({...filters, info: !filters.info})}
                className="accent-blue-500" 
              />
              <span className="text-sm text-gray-700">Info</span>
            </label>
          </div>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={groupByUser} 
              onChange={() => setGroupByUser(!groupByUser)}
              className="accent-purple-500" 
            />
            <span className="text-sm text-gray-700">Group by User</span>
          </label>
        </div>
      </div>

      {/* Activity List */}
      <div className="grid gap-6">
        {!groupByUser ? (
          // Show flat list of activities
          sortedMessages.map((msg, index) => (
            <div 
              key={index}
              className={`
                bg-white rounded-lg p-4 shadow-sm border-l-4 relative
                ${getStatusClasses(msg)}
              `}
            >
              {/* Status Badge */}
              <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-opacity-20 ${getStatusBadgeClasses(msg)}`}>
                {msg.status || 'info'}
              </div>

              {/* User Identity */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                  <p className="text-sm text-gray-500">{msg.rollNumber}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Activity Content */}
              <div className="ml-2">
                {renderActivityContent(msg)}
              </div>

              {/* Metadata */}
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                {msg.roomCode && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    Room: {msg.roomCode}
                  </span>
                )}
                {msg.leetcodeUsername && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    LC: @{msg.leetcodeUsername}
                  </span>
                )}
                {msg.url && (
                  <a 
                    href={msg.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {msg.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          // Show messages grouped by user
          Object.values(groupedMessages).map((group, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              {/* User Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{group.user.name}</h3>
                    <p className="text-sm text-gray-500">{group.user.rollNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {group.messages.length} activities
                    </span>
                    {group.messages.some(m => m.status === 'critical') && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Critical
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User Messages */}
              <div className="divide-y divide-gray-100">
                {group.messages.sort((a, b) => b.timestamp - a.timestamp).map((msg, msgIndex) => (
                  <div 
                    key={msgIndex}
                    className={`p-3 pl-4 border-l-4 relative ${getStatusClasses(msg)}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        {renderActivityContent(msg)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClasses(msg)}`}>
                          {msg.status || 'info'}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                      {msg.roomCode && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          Room: {msg.roomCode}
                        </span>
                      )}
                      {msg.leetcodeUsername && (
                        <span className="bg-blue-100 px-2 py-0.5 rounded">
                          LC: @{msg.leetcodeUsername}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No messages match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contest;