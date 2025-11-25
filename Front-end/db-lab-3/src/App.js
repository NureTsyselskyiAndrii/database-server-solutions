import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "https://localhost:7221/api";

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    let data = null;

    try {
      data = await res.json();
    } catch {}

    if (!res.ok || data?.sql_error || data?.error) {
      const msg = data?.sql_error || data?.error || data?.message || "Unknown server error";
      toast.error(msg);
      return null;
    }

    return data;
  } catch (err) {
    toast.error(err.message);
    return null;
  }
}

function GroupsPage() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    apiFetch(`${API}/Groups/get-all`).then(setGroups);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 font-bold">Groups</h1>
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.group_id} className="border p-4 rounded">
            <div className="font-semibold">
              {g.name} (Start: {g.year_start})
            </div>
            <div>
              Curator: {g.curator.firstName} {g.curator.lastName}
            </div>
            <div className="mt-2 font-semibold">Students:</div>
            <ul className="list-disc ml-6">
              {g.students.map((s) => (
                <li key={s.student_id}>
                  {s.firstName} {s.lastName} —{" "}
                  <Link className="text-blue-600" to={`/student/${s.student_id}`}>
                    Info
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    apiFetch(`${API}/Students/${id}`).then(setStudent);
  }, [id]);

  if (!student) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">
        {student.firstName} {student.lastName}
      </h1>
      <p>Group: {student.group.name}</p>
      <p>Birth Date: {student.birth_date}</p>
      <p>Address: {student.address}</p>

      <h2 className="text-lg font-semibold mt-4">Grades</h2>
      <ul className="list-disc ml-6">
        {student.grades.map((g) => (
          <li key={g.grade_id}>
            {g.subject.name}: {g.grade} {"(" + g.date_grade + ")"}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [belowList, setBelowList] = useState(null); // ← результат SQL функции
  const [params, setParams] = useState({ i_step: 1, k_sum: 100 }); // i_step и k_sum

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    department: "",
    position: "",
    phone: "",
  });

  useEffect(() => {
    apiFetch(`${API}/Teachers/get-all`).then(setTeachers);
  }, []);

  const submit = async () => {
    const res = await apiFetch(
      `${API}/Teachers/insert?FirstName=${form.firstName}&LastName=${form.lastName}&Department=${form.department}&Position=${form.position}&Phone=${form.phone}`,
      { method: "POST" }
    );
    if (!res) return;
    window.location.reload();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Teachers</h1>

      {/* --- SQL Function Section --- */}
      <div className="border p-4 mb-6 rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Teachers Below K (SQL Function)</h2>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            className="border p-2"
            type="number"
            placeholder="i_step"
            value={params.i_step}
            onChange={(e) => setParams({ ...params, i_step: e.target.value })}
          />
          <input
            className="border p-2"
            type="number"
            placeholder="k_sum"
            value={params.k_sum}
            onChange={(e) => setParams({ ...params, k_sum: e.target.value })}
          />
        </div>

        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={async () => {
            const res = await apiFetch(`${API}/Teachers/teachers-below-k?i_step=${params.i_step}&k_sum=${params.k_sum}`);
            if (res) setBelowList(res);
          }}
        >
          Run SQL Function
        </button>
      </div>

      {/* --- SQL function result table --- */}
      {belowList && (
        <div className="border p-4 mb-6 rounded bg-white">
          <h2 className="text-xl font-semibold mb-3">Teachers with total grades below K</h2>

          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Total Grades</th>
              </tr>
            </thead>
            <tbody>
              {belowList.map((t) => (
                <tr key={t.teacher_id}>
                  <td className="border p-2">{t.teacher_id}</td>
                  <td className="border p-2">
                    {t.firstName} {t.lastName}
                  </td>
                  <td className="border p-2">{t.totalGrades}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="bg-gray-600 text-white px-3 py-2 mt-3 rounded" onClick={() => setBelowList(null)}>
            Back to all teachers
          </button>
        </div>
      )}

      {/* --- Add teacher section --- */}
      <div className="border p-4 mb-6 rounded">
        <h2 className="font-semibold mb-2">Add Teacher</h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(form).map((k) => (
            <input key={k} placeholder={k} className="border p-2" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
        </div>
        <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 mt-3 rounded">
          Add
        </button>
      </div>

      {/* --- Teachers list --- */}
      <div className="space-y-4">
        {teachers.map((t) => (
          <div key={t.teacher_id} className="border p-4 rounded">
            <div className="font-xl font-semibold">
              {t.firstName} {t.lastName}
            </div>
            <Link to={`/teacher/${t.teacher_id}`} className="text-blue-600">
              Info
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherPage() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: "", subjectId: "", grade: "" });

  useEffect(() => {
    apiFetch(`${API}/Teachers/get-all`).then((list) => {
      setTeacher(list.find((x) => x.teacher_id == id));
    });
    apiFetch(`${API}/Subjects/get-all`).then(setSubjects);
    apiFetch(`${API}/Students/get-all`).then(setStudents);
  }, [id]);

  const addGrade = async () => {
    const res = await apiFetch(`${API}/Grades/insert?Student_id=${form.studentId}&Subject_id=${form.subjectId}&Grade=${form.grade}`, {
      method: "POST",
    });
    if (!res) return;
    toast.success("Grade added");
  };

  if (!teacher) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        {teacher.firstName} {teacher.lastName}
      </h1>
      <p>
        <strong>Department:</strong> {teacher.department}
      </p>
      <p>
        <strong>Position:</strong> {teacher.position}
      </p>
      <p>
        <strong>Phone:</strong> {teacher.phone}
      </p>
      <h2 className="text-xl font-semibold mt-4">Subjects</h2>
      <ul className="list-disc ml-6">
        {teacher.subjects.map((s) => (
          <li key={s.subject_id}>{s.name}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-4">Groups</h2>
      <ul className="list-disc ml-6">
        {teacher.groups?.map((g) => (
          <li key={g.group_id}>
            {g.name} — {g.year_start}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Add Grade</h2>
      <div className="grid grid-cols-3 gap-2 max-w-lg">
        <select className="border p-2" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s.student_id} value={s.student_id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        <select className="border p-2" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
          <option value="">Select subject</option>
          {subjects
            .filter((x) => x.teacher.teacher_id == id)
            .map((s) => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.name}
              </option>
            ))}
        </select>

        <input
          type="number"
          className="border p-2"
          placeholder="Grade"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
        />
      </div>
      <button onClick={addGrade} className="bg-green-600 text-white px-4 py-2 mt-3 rounded">
        Add
      </button>
    </div>
  );
}

function StatsPage() {
  const [avgCount, setAvgCount] = useState(null);
  const [limit, setLimit] = useState(60);
  const [limitCount, setLimitCount] = useState(null);

  const loadAvg = () => {
    apiFetch(`${API}/Grades/less-than-avg`).then((d) => setAvgCount(d.count));
  };

  const loadLimit = () => {
    apiFetch(`${API}/Grades/count-below?limit=${limit}`).then((d) => setLimitCount(d.count));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <div className="mt-4 p-4 border rounded">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={loadAvg}>
          Load less-than-avg
        </button>
        {avgCount !== null && <div className="mt-2">Count: {avgCount}</div>}
      </div>

      <div className="mt-4 p-4 border rounded">
        <input type="number" className="border p-2" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 ml-2 rounded" onClick={loadLimit}>
          Load
        </button>
        {limitCount !== null && <div className="mt-2">Count: {limitCount}</div>}
      </div>
    </div>
  );
}

function AllGradesPage() {
  const [grades, setGrades] = useState([]);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [filters, setFilters] = useState({
    studentId: "",
    subjectId: "",
    teacherId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    // Load all grades
    apiFetch(`${API}/Grades/get-all`).then(setGrades);
    // Load filters data
    apiFetch(`${API}/Students/get-all`).then(setStudents);
    apiFetch(`${API}/Subjects/get-all`).then(setSubjects);
    apiFetch(`${API}/Teachers/get-all`).then(setTeachers);
  }, []);

  const save = async (id) => {
    const res = await apiFetch(`${API}/Grades/update-grade/${id}?newValue=${newValue}`, {
      method: "PUT",
    });

    if (!res) return;
    toast.success("Updated!");
    setEditingId(null);
    setNewValue("");

    // Reload grades
    apiFetch(`${API}/Grades/get-all`).then(setGrades);
  };

  // Filtering logic
  const filtered = grades.filter((g) => {
    return (
      (!filters.studentId || g.student.student_id == filters.studentId) &&
      (!filters.subjectId || g.subject.subject_id == filters.subjectId) &&
      (!filters.teacherId || g.subject.teacher.teacher_id == filters.teacherId)
    );
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Grades</h1>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        {/* Students */}
        <select className="border p-2" value={filters.studentId} onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}>
          <option value="">All students</option>
          {students.map((s) => (
            <option key={s.student_id} value={s.student_id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        {/* Subjects */}
        <select className="border p-2" value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}>
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Teachers */}
        <select className="border p-2" value={filters.teacherId} onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })}>
          <option value="">All teachers</option>
          {teachers.map((t) => (
            <option key={t.teacher_id} value={t.teacher_id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Subject</th>
            <th className="p-2 border">Teacher</th>
            <th className="p-2 border">Grade</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Edit</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((g) => (
            <tr key={g.grade_id} className="border-b">
              <td className="p-2 border">
                {g.student.firstName} {g.student.lastName}
              </td>

              <td className="p-2 border">{g.subject.name}</td>

              <td className="p-2 border">
                {g.subject.teacher.firstName} {g.subject.teacher.lastName}
              </td>

              <td className="p-2 border">
                {editingId === g.grade_id ? (
                  <input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="border p-1 w-20" />
                ) : (
                  g.grade
                )}
              </td>

              <td className="p-2 border">{g.date_grade}</td>

              <td className="p-2 border">
                {editingId === g.grade_id ? (
                  <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => save(g.grade_id)}>
                    Save
                  </button>
                ) : (
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setEditingId(g.grade_id);
                      setNewValue(g.grade);
                    }}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogsPage() {
  const [blockLogs, setBlockLogs] = useState([]);
  const [gradesLogs, setGradesLogs] = useState([]);

  useEffect(() => {
    apiFetch(`${API}/Logs/get-all-block-logs`).then(setBlockLogs);
    apiFetch(`${API}/Logs/get-all-grades-logs`).then(setGradesLogs);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Logs</h1>

      {/* Block Logs */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Block Logs</h2>

        <table className="min-w-full border mb-4">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>

          <tbody>
            {blockLogs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-2 border">{log.id}</td>
                <td className="p-2 border">{log.userName || "-"}</td>
                <td className="p-2 border">{log.reason || "-"}</td>
                <td className="p-2 border">{log.actionType}</td>
                <td className="p-2 border">{log.attemptDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grades Logs */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Grades Logs</h2>

        <table className="min-w-full border">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Grade ID</th>
              <th className="p-2 border">Old Value</th>
              <th className="p-2 border">New Value</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>

          <tbody>
            {gradesLogs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-2 border">{log.id}</td>
                <td className="p-2 border">{log.grade_id}</td>
                <td className="p-2 border">{log.oldGrade}</td>
                <td className="p-2 border">{log.newGrade}</td>
                <td className="p-2 border">{log.modifyDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsToolsPage() {
  const [groups, setGroups] = useState([]);

  // Inputs
  const [minGrade, setMinGrade] = useState(60);
  const [department, setDepartment] = useState("");
  const [department2, setDepartment2] = useState("");

  const [insertForm, setInsertForm] = useState({
    firstName: "",
    lastName: "",
    birth_date: "",
    address: "",
    group_id: "",
  });

  const [eachSecondMin, setEachSecondMin] = useState(50);

  // Results
  const [countResult, setCountResult] = useState(null);
  const [eachSecondList, setEachSecondList] = useState([]);

  useEffect(() => {
    apiFetch(`${API}/Groups/get-all`).then(setGroups);
  }, []);

  // 1) Count by grade and department
  const loadCount = () => {
    apiFetch(`${API}/Students/count-by-grade-department?MinGrade=${minGrade}&Department=${department}`).then((d) => setCountResult(d.result));
  };

  // 2) Update description
  const updateDescription = () => {
    const res = apiFetch(`${API}/Students/update-description?Department=${department2}`, { method: "POST" });
    if (!res) return;
    toast.success("Student updated");
  };

  // 3) Insert student
  const insertStudent = () => {
    const f = insertForm;
    const res = apiFetch(
      `${API}/Students/insert?FirstName=${f.firstName}&LastName=${f.lastName}` +
        `&Birth_date=${f.birth_date}&Address=${f.address}&Group_id=${f.group_id}`,
      { method: "POST" }
    );
    if (!res) return;
    toast.success("Student inserted");
  };

  // 4) Each second student
  const loadEachSecond = () => {
    apiFetch(`${API}/Students/each-second-student?min_grades=${eachSecondMin}`).then(setEachSecondList);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Students Tools</h1>

      {/* COUNT BY GRADE + DEPARTMENT */}
      <div className="border p-4 mb-6 rounded">
        <h2 className="text-xl font-semibold mb-2">Count Students by Grade + Department</h2>

        <div className="flex gap-2">
          <input type="number" className="border p-2" placeholder="Min grade" value={minGrade} onChange={(e) => setMinGrade(e.target.value)} />
          <input className="border p-2" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={loadCount}>
            Load
          </button>
        </div>

        {countResult !== null && <div className="mt-2">Result: {countResult}</div>}
      </div>

      {/* UPDATE SUBJECTS DESCRIPTION */}
      <div className="border p-4 mb-6 rounded">
        <h2 className="text-xl font-semibold mb-2">Update Subjects Description (by Department)</h2>

        <div className="flex gap-2">
          <input className="border p-2" placeholder="Department" value={department2} onChange={(e) => setDepartment2(e.target.value)} />
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={updateDescription}>
            Execute
          </button>
        </div>
      </div>

      {/* INSERT STUDENT */}
      <div className="border p-4 mb-6 rounded">
        <h2 className="text-xl font-semibold mb-2">Insert Student</h2>

        <div className="grid grid-cols-2 gap-2">
          <input
            className="border p-2"
            placeholder="First name"
            value={insertForm.firstName}
            onChange={(e) => setInsertForm({ ...insertForm, firstName: e.target.value })}
          />
          <input
            className="border p-2"
            placeholder="Last name"
            value={insertForm.lastName}
            onChange={(e) => setInsertForm({ ...insertForm, lastName: e.target.value })}
          />
          <input
            type="date"
            className="border p-2"
            value={insertForm.birth_date}
            onChange={(e) => setInsertForm({ ...insertForm, birth_date: e.target.value })}
          />
          <input
            className="border p-2"
            placeholder="Address"
            value={insertForm.address}
            onChange={(e) => setInsertForm({ ...insertForm, address: e.target.value })}
          />

          <select className="border p-2" value={insertForm.group_id} onChange={(e) => setInsertForm({ ...insertForm, group_id: e.target.value })}>
            <option value="">Select group</option>
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <button className="bg-purple-600 text-white px-4 py-2 mt-3 rounded" onClick={insertStudent}>
          Insert
        </button>
      </div>

      {/* EACH SECOND STUDENT */}
      <div className="border p-4 mb-6 rounded">
        <h2 className="text-xl font-semibold mb-2">Each Second Student (min grades)</h2>

        <div className="flex gap-2">
          <input type="number" className="border p-2" value={eachSecondMin} onChange={(e) => setEachSecondMin(e.target.value)} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={loadEachSecond}>
            Load
          </button>
        </div>

        {eachSecondList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {eachSecondList.map((x, i) => (
              <div key={i} className="border p-4 rounded-lg shadow bg-white">
                <h3 className="text-lg font-semibold">
                  {x.firstName} {x.lastName}
                </h3>

                <p className="text-gray-600 mt-1">
                  <strong>Group:</strong> {x.groupName}
                </p>

                <p className="text-gray-600">
                  <strong>Grades Count:</strong> {x.gradesCount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    apiFetch(`${API}/Subjects/get-all`).then(setSubjects);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Subjects</h1>

      <div className="space-y-4">
        {subjects.map((s) => (
          <div key={s.subject_id} className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold">{s.name}</h2>

            <p>
              <strong>Hours:</strong> {s.hours}
            </p>
            <p>
              <strong>Description:</strong> {s.description || "—"}
            </p>

            <p className="mt-2">
              <strong>Teacher:</strong> {s.teacher.firstName} {s.teacher.lastName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="p-4 space-x-4 border-b mb-4">
        <Link to="/">Groups</Link>
        <Link to="/teachers">Teachers</Link>
        <Link to="/subjects">Subjects</Link>
        <Link to="/stats">Statistics</Link>
        <Link to="/grades">All Grades</Link>
        <Link to="/logs">Logs</Link>
        <Link to="/students-tools">Students Tools</Link>
      </div>

      <Routes>
        <Route path="/" element={<GroupsPage />} />
        <Route path="/student/:id" element={<StudentPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/teacher/:id" element={<TeacherPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/grades" element={<AllGradesPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/students-tools" element={<StudentsToolsPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
      </Routes>
    </Router>
  );
}
