import { useState, useEffect, useMemo } from 'react';
import { backendUrl, socketUrl } from '../../../utils/routes';
import axios from 'axios';
import UserActivityModal from '../../../components/UserActivityModal';

const Contest = () => {
  const [realTimeMessages, setRealTimeMessages] = useState([]);
  const [historicalLogs, setHistoricalLogs] = useState([]);
  const [ws, setWs] = useState(null);
  const [filters, setFilters] = useState({
    critical: true,
    warning: true,
    info: true
  });
  const [userFilter, setUserFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [groupByUser, setGroupByUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const token = localStorage.getItem("jwtToken");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHistoricalLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/contest/logs`, {
        params: {
          page: pageNum,
          limit: 50
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHistoricalLogs(prev => [...prev, ...response.data]);
      setHasMore(response.data.length === 50);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch historical logs:', err);
      setError('Failed to load historical data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalLogs();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistoricalLogs(nextPage);
  };

  useEffect(() => {
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setRealTimeMessages(prev => [
        { ...message, timestamp: Date.now(), isRealTime: true }, 
        ...prev.slice(0, 49)
      ]);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    setWs(socket);

    return () => socket.close();
  }, []);

  const combinedMessages = useMemo(() => {
    const normalizedHistoricalLogs = historicalLogs.map(log => {
      if (!log.user) {
        return {
          ...log,
          user: {
            name: log.name || log.user?.name || 'Unknown User',
            rollNumber: log.rollNumber || log.user?.rollNumber || 'Unknown ID',
            leetcodeUsername: log.leetcodeUsername || log.user?.leetcodeUsername
          }
        };
      }
      return log;
    });

    const normalizedRealTimeMessages = realTimeMessages.map(msg => {
      if (!msg.user) {
        return {
          ...msg,
          user: {
            name: msg.name || 'Unknown User',
            rollNumber: msg.rollNumber || 'Unknown ID',
            leetcodeUsername: msg.leetcodeUsername
          }
        };
      }
      return msg;
    });

    const allMessages = [...normalizedRealTimeMessages, ...normalizedHistoricalLogs];

    if (allMessages.length > 0 && !window.messageLogged) {
      console.log('Message structure sample:', allMessages[0]);
      window.messageLogged = true;
    }

    const uniqueMessages = allMessages.reduce((acc, current) => {
      const existingKey = current.user?.rollNumber ? 
        `${current.timestamp}-${current.message}-${current.user.rollNumber}` :
        `${current.timestamp}-${current.message}`;
      
      const exists = acc.some(msg => {
        const msgKey = msg.user?.rollNumber ? 
          `${msg.timestamp}-${msg.message}-${msg.user.rollNumber}` :
          `${msg.timestamp}-${msg.message}`;
        
        return msgKey === existingKey;
      });
      
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return uniqueMessages;
  }, [realTimeMessages, historicalLogs]);

  const filteredMessages = useMemo(() => {
    return combinedMessages.filter(msg => {
      const status = msg.status || 'info';
      if (!filters[status]) return false;
      
      if (userFilter && !msg.user.name?.toLowerCase().includes(userFilter.toLowerCase()) && 
          !msg.user.rollNumber?.toLowerCase().includes(userFilter.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [combinedMessages, filters, userFilter]);

  const sortedMessages = useMemo(() => {
    return [...filteredMessages].sort((a, b) => {
      if (sortBy === 'timestamp') return b.timestamp - a.timestamp;
      if (sortBy === 'status') {
        const statusPriority = { 'critical': 0, 'warning': 1, 'info': 2 };
        return statusPriority[a.status || 'info'] - statusPriority[b.status || 'info'];
      }
      if (sortBy === 'user') return a.name?.localeCompare(b.name || '');
      return 0;
    });
  }, [filteredMessages, sortBy]);

  const groupedMessages = useMemo(() => {
    const groups = {};
    if (groupByUser) {
      sortedMessages.forEach(msg => {
        const rollNumber = msg.user?.rollNumber || 'unknown';
        
        if (!groups[rollNumber]) {
          groups[rollNumber] = {
            user: { 
              name: msg.user?.name || 'Unknown User', 
              rollNumber: rollNumber 
            },
            messages: []
          };
        }
        groups[rollNumber].messages.push(msg);
      });
    }
    return groups;
  }, [sortedMessages, groupByUser]);

  const stats = useMemo(() => ({
    totalMessages: combinedMessages.length,
    uniqueUsers: new Set(combinedMessages.map(m => m.user?.rollNumber || 'unknown')).size,
    activeRooms: new Set(combinedMessages.map(m => m.roomCode)).size,
    criticalCount: combinedMessages.filter(m => m.status === 'critical').length,
    warningCount: combinedMessages.filter(m => m.status === 'warning').length
  }), [combinedMessages]);

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

  const openUserDetails = (userRollNumber) => {
    const userGroup = groupedMessages[userRollNumber];
    if (userGroup) {
      setSelectedUser({
        user: userGroup.user,
        activities: userGroup.messages
      });
      setIsModalOpen(true);
    }
  };

  const debugFirstMessage = () => {
    if (combinedMessages.length > 0) {
      console.log('First message structure:', combinedMessages[0]);
      alert(`First message user info: ${JSON.stringify(combinedMessages[0].user || {})}`);
    } else {
      alert('No messages available');
    }
  };

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Activity Monitor</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="bg-blue-100 px-3 py-1 rounded-full">
            Total Messages: {stats.totalMessages}
          </div>
          <div className="bg-green-100 px-3 py-1 rounded-full">
            Active Rooms: {stats.activeRooms}
          </div>
          <div className="bg-purple-100 px-3 py-1 rounded-full">
            Unique Users: {stats.uniqueUsers}
          </div>
          <div className="bg-red-100 px-3 py-1 rounded-full">
            Critical: {stats.criticalCount}
          </div>
          <div className="bg-yellow-100 px-3 py-1 rounded-full">
            Warnings: {stats.warningCount}
          </div>
          <button 
            onClick={debugFirstMessage}
            className="bg-gray-200 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-300"
          >
            Debug
          </button>
        </div>
      </div>

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

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
          <button 
            onClick={() => fetchHistoricalLogs()} 
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {!groupByUser ? (
          sortedMessages.map((msg, index) => (
            <div 
              key={`${msg.timestamp}-${index}`}
              className={`bg-white rounded-lg p-4 shadow-sm border-l-4 relative ${getStatusClasses(msg)} ${msg.isRealTime ? 'ring-1 ring-blue-300' : ''}`}
            >
              {msg.isRealTime && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
              
              <div className={`absolute top-2 ${msg.isRealTime ? 'right-16' : 'right-2'} text-xs px-2 py-1 rounded-full bg-opacity-20 ${getStatusBadgeClasses(msg)}`}>
                {msg.status || 'info'}
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{msg.user?.name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-500">{msg.user?.rollNumber || 'Unknown ID'}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="ml-2">
                {renderActivityContent(msg)}
              </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(groupedMessages).map((group, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className={`p-4 ${group.messages.some(m => m.status === 'critical') 
                  ? 'bg-red-50 border-b border-red-200' 
                  : group.messages.some(m => m.status === 'warning')
                  ? 'bg-yellow-50 border-b border-yellow-200'
                  : 'bg-blue-50 border-b border-blue-200'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                        {group.user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{group.user.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-500">{group.user.rollNumber || 'No ID'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {group.messages.length} activities
                      </span>
                      {group.messages.some(m => m.status === 'critical') && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                          Critical
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex justify-between text-xs text-gray-600">
                    <div>Last activity: {new Date(Math.max(...group.messages.map(m => m.timestamp))).toLocaleTimeString()}</div>
                    <div>
                      {group.messages.some(m => m.isRealTime) && (
                        <span className="inline-flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto max-h-64">
                  <div className="divide-y divide-gray-100">
                    {group.messages
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .slice(0, 5)
                      .map((msg, msgIndex) => (
                        <div 
                          key={msgIndex}
                          className={`p-3 pl-4 border-l-4 ${getStatusClasses(msg)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 text-sm">
                              {renderActivityContent(msg)}
                            </div>
                            <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          
                          <div className="mt-1 flex flex-wrap gap-1 text-xs text-gray-500">
                            {msg.roomCode && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {msg.roomCode}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex gap-1">
                    {group.messages.some(m => m.status === 'critical') && (
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                    {group.messages.some(m => m.status === 'warning') && (
                      <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    )}
                    {group.messages.some(m => m.status === 'info') && (
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <button 
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => openUserDetails(group.user.rollNumber)}
                  >
                    View all activities
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredMessages.length === 0 && !loading && (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No messages match your filters</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load More
          </button>
        )}
      </div>
      
      <UserActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser?.user || {}}
        activities={selectedUser?.activities || []}
        renderActivityContent={renderActivityContent}
        getStatusClasses={getStatusClasses}
        getStatusBadgeClasses={getStatusBadgeClasses}
      />
    </div>
  );
};

export default Contest;