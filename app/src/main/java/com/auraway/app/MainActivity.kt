package com.auraway.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.auraway.app.model.UserRole
import com.auraway.app.ui.WelcomeScreen
import com.auraway.app.ui.student.StudentMainScreen
import com.auraway.app.ui.teacher.TeacherMainScreen
import com.auraway.app.ui.theme.AuraWayTheme
import com.auraway.app.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val currentRole by viewModel.currentRole.collectAsState()
            val students by viewModel.students.collectAsState()
            val activeStudentId by viewModel.activeStudentId.collectAsState()

            AuraWayTheme(role = currentRole) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Crossfade(targetState = currentRole, label = "roleTransition") { role ->
                        when (role) {
                            UserRole.WELCOME -> WelcomeScreen(
                                students = students,
                                activeStudentId = activeStudentId,
                                onSelectStudent = { studentId -> viewModel.selectActiveStudent(studentId) },
                                onRoleSelected = { selectedRole -> viewModel.selectRole(selectedRole) }
                            )
                            UserRole.STUDENT -> StudentMainScreen(
                                viewModel = viewModel,
                                onSwitchRole = { viewModel.selectRole(UserRole.WELCOME) }
                            )
                            UserRole.TEACHER -> TeacherMainScreen(
                                viewModel = viewModel,
                                onSwitchRole = { viewModel.selectRole(UserRole.WELCOME) }
                            )
                        }
                    }
                }
            }
        }
    }
}
