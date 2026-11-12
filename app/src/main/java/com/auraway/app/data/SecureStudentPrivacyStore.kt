package com.auraway.app.data

import com.auraway.app.model.RoutineItem
import com.auraway.app.model.StudentProfile

/**
 * Enforces student data privacy policies before exposing data to teacher interface.
 */
object SecureStudentPrivacyStore {

    /**
     * Inspects student privacy toggle. If disabled, masks student routine data from teacher.
     */
    fun filterRoutineForTeacherInspection(
        student: StudentProfile,
        routines: List<RoutineItem>
    ): List<RoutineItem>? {
        return if (student.isRoutineVisibleToTeacher) {
            routines
        } else {
            // Masked / Hidden from teacher
            null
        }
    }
}
