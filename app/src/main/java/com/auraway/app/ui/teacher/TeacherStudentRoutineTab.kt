package com.auraway.app.ui.teacher

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.auraway.app.model.RoutineItem
import com.auraway.app.model.RoutineStatus
import com.auraway.app.model.StudentProfile
import com.auraway.app.ui.theme.ErrorRed
import com.auraway.app.ui.theme.StudentPrimary
import com.auraway.app.ui.theme.SuccessGreen
import com.auraway.app.ui.theme.TeacherPrimary

@Composable
fun TeacherStudentRoutineTab(
    students: List<StudentProfile>,
    routineItems: List<RoutineItem> // Active student's routine items
) {
    var selectedStudentId by remember { mutableStateOf(students.firstOrNull()?.id ?: "s1") }
    val currentStudent = students.find { it.id == selectedStudentId } ?: students[0]

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Column {
            Text(
                text = "Student Routine Inspector",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = TeacherPrimary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Respects student privacy settings. Routines are only viewable if enabled by the student.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Student Selector Chips
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            students.forEach { student ->
                val isSelected = selectedStudentId == student.id
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedStudentId = student.id },
                    label = { Text("${student.avatarEmoji} ${student.name}") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = TeacherPrimary,
                        selectedLabelColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        }

        // Privacy Check Block
        if (!currentStudent.isRoutineVisibleToTeacher) {
            // Routine Privacy is OFF Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = Color.Gray.copy(alpha = 0.2f),
                        modifier = Modifier.size(64.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = Color.Gray,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }

                    Text(
                        text = "Routine is Private",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = "${currentStudent.name} has disabled teacher visibility for their daily routine. Students retain full control over their personal daily habit data.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 14.sp
                    )
                }
            }
        } else {
            // Routine Privacy is ON: Display Routine Items
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = TeacherPrimary.copy(alpha = 0.12f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "👁️ ${currentStudent.name}'s Shared Daily Routine",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TeacherPrimary
                        )
                        Text(
                            text = "Consistency: ${currentStudent.consistencyRate}%",
                            style = MaterialTheme.typography.labelLarge,
                            color = TeacherPrimary,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(routineItems, key = { it.id }) { item ->
                        TeacherViewRoutineItemCard(item = item)
                    }
                }
            }
        }
    }
}

@Composable
private fun TeacherViewRoutineItemCard(item: RoutineItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "${item.category} • ${item.timeSlot}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Surface(
                shape = CircleShape,
                color = when (item.status) {
                    RoutineStatus.COMPLETED -> SuccessGreen.copy(alpha = 0.15f)
                    RoutineStatus.MISSED -> ErrorRed.copy(alpha = 0.15f)
                    RoutineStatus.PENDING -> MaterialTheme.colorScheme.surfaceVariant
                }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = when (item.status) {
                            RoutineStatus.COMPLETED -> Icons.Default.Check
                            RoutineStatus.MISSED -> Icons.Default.Close
                            RoutineStatus.PENDING -> Icons.Default.Schedule
                        },
                        contentDescription = null,
                        tint = when (item.status) {
                            RoutineStatus.COMPLETED -> SuccessGreen
                            RoutineStatus.MISSED -> ErrorRed
                            RoutineStatus.PENDING -> MaterialTheme.colorScheme.onSurfaceVariant
                        },
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = item.status.name,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = when (item.status) {
                            RoutineStatus.COMPLETED -> SuccessGreen
                            RoutineStatus.MISSED -> ErrorRed
                            RoutineStatus.PENDING -> MaterialTheme.colorScheme.onSurfaceVariant
                        }
                    )
                }
            }
        }
    }
}
