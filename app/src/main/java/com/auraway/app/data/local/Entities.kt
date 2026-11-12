package com.auraway.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "students")
data class StudentEntity(
    @PrimaryKey val id: String,
    val name: String,
    val avatarEmoji: String,
    val consistencyRate: Int,
    val isRoutineVisibleToTeacher: Boolean
)

@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey val id: String,
    val studentId: String,
    val title: String,
    val timeSlot: String,
    val category: String,
    val status: String // PENDING, COMPLETED, MISSED
)

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: String,
    val title: String,
    val subject: String,
    val dueDate: String,
    val instructions: String,
    val assignedToStudentId: String?, // null = all students
    val status: String, // PENDING, DONE, REASON_SUBMITTED, EXCUSED, EXTENDED
    val extendedDueDate: String? = null
)

@Entity(tableName = "reason_submissions")
data class ReasonSubmissionEntity(
    @PrimaryKey val id: String,
    val taskId: String,
    val studentId: String,
    val submittedBy: String, // STUDENT, PARENT
    val reasonTag: String,
    val note: String,
    val timestamp: Long
)

@Entity(tableName = "wellness")
data class WellnessEntity(
    @PrimaryKey val studentId: String,
    val waterGlasses: Int,
    val targetWaterGlasses: Int,
    val selectedMood: String,
    val moodNotes: String
)
