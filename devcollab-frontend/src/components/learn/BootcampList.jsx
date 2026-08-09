import React from 'react';
import BootcampCard from './BootcampCard';

const BootcampList = ({ bootcamps, enrolledBootcamps = [] }) => {
  if (!bootcamps || bootcamps.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-border rounded-2xl shadow-sm">
        <span className="text-4xl">📚</span>
        <h3 className="text-lg font-bold text-textPrimary mt-4">No bootcamps found</h3>
        <p className="text-sm text-textSecondary mt-1">Try resetting the filters or check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bootcamps.map(bootcamp => {
        const enrollment = enrolledBootcamps.find(
          e => e.bootcampId === bootcamp._id || e.bootcampId?._id === bootcamp._id
        );
        return (
          <BootcampCard 
            key={bootcamp._id} 
            bootcamp={bootcamp} 
            isEnrolled={!!enrollment} 
            progress={enrollment ? enrollment.progress : 0} 
          />
        );
      })}
    </div>
  );
};

export default BootcampList;
