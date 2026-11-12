package com.auraway.app.ui.teacher

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AssignmentTurnedIn
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.auraway.app.model.StudentProfile
import com.auraway.app.ui.theme.TeacherPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherAssignTaskTab(
    students: List<StudentProfile>,
    onAssignTask: (title: String, subject: String, dueDate: String, instructions: String, targetStudentId: String?) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("Mathematics") }
    var dueDate by remember { mutableStateOf("Tomorrow, 5:00 PM") }
    var instructions by remember { mutableStateOf("") }
    var selectedTargetStudentId by remember { mutableStateOf<String?>(null) } // null = All students

    var showSuccessSnackbar by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Column {
            Text(
                text = "Quick Task Assignment",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = TeacherPrimary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Create and dispatch homework, projects, or study goals to students",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Target Student Dropdown/Filter Chips
                Column {
                    Text(
                        text = "Assign Target",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilterChip(
                            selected = selectedTargetStudentId == null,
                            onClick = { selectedTargetStudentId = null },
                            label = { Text("👥 All Students") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = TeacherPrimary,
                                selectedLabelColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )
                        students.forEach { student ->
                            val isSelected = selectedTargetStudentId == student.id
                            FilterChip(
                                selected = isSelected,
                                onClick = { selectedTargetStudentId = student.id },
                                label = { Text("${student.avatarEmoji} ${student.name.split(" ")[0]}") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = TeacherPrimary,
                                    selectedLabelColor = Color.White
                                ),
                                shape = RoundedCornerShape(12.dp)
                            )
                        }
                    }
                }

                // Title
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Task / Homework Title") },
                    placeholder = { Text("e.g. Calculus Derivatives Worksheet") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                // Subject
                OutlinedTextField(
                    value = subject,
                    onValueChange = { subject = it },
                    label = { Text("Subject / Course") },
                    placeholder = { Text("e.g. Mathematics, Physics, History") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                // Due Date
                OutlinedTextField(
                    value = dueDate,
                    onValueChange = { dueDate = it },
                    label = { Text("Due Date & Time") },
                    placeholder = { Text("e.g. Friday, 11:59 PM") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                // Instructions
                OutlinedTextField(
                    value = instructions,
                    onValueChange = { instructions = it },
                    label = { Text("Short Instructions & Requirements") },
                    placeholder = { Text("e.g. Complete exercises 1-10 on page 45. Upload clean copy.") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    minLines = 3,
                    maxLines = 5
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Assign Button
                Button(
                    onClick = {
                        if (title.isNotBlank()) {
                            onAssignTask(title, subject, dueDate, instructions, selectedTargetStudentId)
                            title = ""
                            instructions = ""
                            showSuccessSnackbar = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TeacherPrimary),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(imageVector = Icons.Default.Send, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Dispatch Task to Students", fontWeight = FontWeight.Bold)
                }

                if (showSuccessSnackbar) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFF38A169).copy(alpha = 0.15f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(imageVector = Icons.Default.AssignmentTurnedIn, contentDescription = null, tint = Color(0xFF38A169))
                            Text("Task assigned and synced live to student dashboard!", style = MaterialTheme.typography.bodySmall, color = Color(0xFF38A169), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
