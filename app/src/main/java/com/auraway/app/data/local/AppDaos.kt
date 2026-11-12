package com.auraway.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface StudentDao {
    @Query("SELECT * FROM students")
    fun getAllStudents(): Flow<List<StudentEntity>>

    @Query("SELECT * FROM students WHERE id = :studentId")
    fun getStudentById(studentId: String): Flow<StudentEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudent(student: StudentEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllStudents(students: List<StudentEntity>)

    @Query("UPDATE students SET isRoutineVisibleToTeacher = :visible WHERE id = :studentId")
    suspend fun updateRoutineVisibility(studentId: String, visible: Boolean)

    @Query("UPDATE students SET consistencyRate = :rate WHERE id = :studentId")
    suspend fun updateConsistencyRate(studentId: String, rate: Int)
}

@Dao
interface RoutineDao {
    @Query("SELECT * FROM routines WHERE studentId = :studentId")
    fun getRoutinesForStudent(studentId: String): Flow<List<RoutineEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoutine(routine: RoutineEntity)

    @Query("UPDATE routines SET status = :status WHERE id = :itemId")
    suspend fun updateRoutineStatus(itemId: String, status: String)

    @Query("DELETE FROM routines WHERE id = :itemId")
    suspend fun deleteRoutine(itemId: String)
}

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks")
    fun getAllTasks(): Flow<List<TaskEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: TaskEntity)

    @Query("UPDATE tasks SET status = :status WHERE id = :taskId")
    suspend fun updateTaskStatus(taskId: String, status: String)

    @Query("UPDATE tasks SET status = 'EXTENDED', extendedDueDate = :newDueDate WHERE id = :taskId")
    suspend fun extendTaskDeadline(taskId: String, newDueDate: String)
}

@Dao
interface ReasonSubmissionDao {
    @Query("SELECT * FROM reason_submissions WHERE taskId = :taskId")
    fun getSubmissionForTask(taskId: String): Flow<ReasonSubmissionEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubmission(submission: ReasonSubmissionEntity)
}

@Dao
interface WellnessDao {
    @Query("SELECT * FROM wellness WHERE studentId = :studentId")
    fun getWellnessForStudent(studentId: String): Flow<WellnessEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertWellness(wellness: WellnessEntity)
}
