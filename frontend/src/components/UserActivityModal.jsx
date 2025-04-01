import React from 'react';

const UserActivityModal = ({ isOpen, onClose, user, activities, renderActivityContent, getStatusClasses, getStatusBadgeClasses }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold">
              {user.name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name || 'Unknown User'}</h2>
              <p className="text-gray-500">{user.rollNumber || 'No ID'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Activity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-gray-50 p-3 rounded shadow-sm">
                <div className="text-sm text-gray-500">Total Activities</div>
                <div className="text-2xl font-bold">{activities.length}</div>
              </div>
              <div className="bg-red-50 p-3 rounded shadow-sm">
                <div className="text-sm text-gray-500">Critical</div>
                <div className="text-2xl font-bold">{activities.filter(a => a.status === 'critical').length}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded shadow-sm">
                <div className="text-sm text-gray-500">Warnings</div>
                <div className="text-2xl font-bold">{activities.filter(a => a.status === 'warning').length}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded shadow-sm">
                <div className="text-sm text-gray-500">Info</div>
                <div className="text-2xl font-bold">{activities.filter(a => a.status === 'info' || !a.status).length}</div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-700 mb-2">All Activities</h3>
          <div className="space-y-3">
            {activities.sort((a, b) => b.timestamp - a.timestamp).map((activity, index) => (
              <div 
                key={index}
                className={`p-4 rounded-md shadow-sm border-l-4 relative ${getStatusClasses(activity)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    {renderActivityContent(activity)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClasses(activity)}`}>
                      {activity.status || 'info'}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                  {activity.roomCode && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Room: {activity.roomCode}
                    </span>
                  )}
                  {activity.leetcodeUsername && (
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      LC: @{activity.leetcodeUsername}
                    </span>
                  )}
                  {activity.url && (
                    <a 
                      href={activity.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {activity.url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mr-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityModal;
