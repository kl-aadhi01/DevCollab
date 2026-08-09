import React from 'react';

const StudentList = ({ students }) => {
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 border border-dashed rounded-xl">
        <p className="text-sm text-textSecondary">No students enrolled in this bootcamp yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border text-xs font-bold text-textSecondary uppercase tracking-wider">
            <th className="pb-3 pr-4">Student</th>
            <th className="pb-3 px-4">Progress</th>
            <th className="pb-3 px-4">Status</th>
            <th className="pb-3 pl-4">Enrolled At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {students.map((record) => {
            const student = record.studentId;
            if (!student) return null;
            return (
              <tr key={record._id || student._id} className="hover:bg-slate-50/50">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase text-slate-700">
                      {student.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-textPrimary leading-none">{student.name}</p>
                      <p className="text-xs text-textSecondary mt-0.5">@{student.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${record.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-textSecondary">{record.progress}%</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    record.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : record.status === 'dropped'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-indigo-50 text-primary'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="py-4 pl-4 text-xs text-textSecondary">
                  {new Date(record.enrolledAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
