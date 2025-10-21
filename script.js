let isSimulating = false;
let simulationInterval;
let currentTime = 0;

document.addEventListener('DOMContentLoaded', function() {
    renderStudents();
    renderAlerts();
    updateStats();
    
    document.getElementById('simulate-btn').addEventListener('click', startSimulation);
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});

function renderStudents() {
    const grid = document.getElementById('students-grid');
    grid.innerHTML = '';
    
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = `student-card ${student.status}`;
        card.innerHTML = `
            <div class="icon">${getStatusIcon(student.status)}</div>
            <div class="name">${student.name.split(' ')[0]}</div>
        `;
        card.onclick = () => showStudentDetails(student);
        grid.appendChild(card);
    });
}

function getStatusIcon(status) {
    if (status === 'normal') return '🟢';
    if (status === 'warning') return '🟡';
    return '🔴';
}

function renderAlerts() {
    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = '';
    
    const urgentStudents = students.filter(s => s.status === 'urgent' || s.status === 'warning');
    
    if (urgentStudents.length === 0) {
        alertsList.innerHTML = '<p style="text-align: center; color: #28a745; padding: 20px;">✅ لا توجد تنبيهات حالياً</p>';
        return;
    }
    
    urgentStudents.forEach(student => {
        const alert = document.createElement('div');
        alert.className = `alert-item ${student.status}`;
        
        let indicator = getMainIndicator(student);
        
        alert.innerHTML = `
            <div class="alert-header">
                <span class="student-name">${student.name}</span>
                <span class="priority">${student.status === 'urgent' ? 'عاجل' : 'تحذير'}</span>
            </div>
            <div class="indicator">
                <i class="fas fa-exclamation-triangle"></i>
                ${indicator}
            </div>
        `;
        alert.onclick = () => showStudentDetails(student);
        alertsList.appendChild(alert);
    });
}

function getMainIndicator(student) {
    if (student.responseTime > 40) {
        return `تأخر في الاستجابة (${student.responseTime} ثانية)`;
    }
    if (student.engagement < 50) {
        return `انخفاض التفاعل (${student.engagement}%)`;
    }
    if (student.exits > 3) {
        return `خروج متكرر (${student.exits} مرات)`;
    }
    if (student.responseTime > 25) {
        return `تأخر ملحوظ في الاستجابة`;
    }
    if (student.engagement < 70) {
        return `تفاعل أقل من المعتاد`;
    }
    return `يحتاج متابعة`;
}

function updateStats() {
    const normal = students.filter(s => s.status === 'normal').length;
    const warning = students.filter(s => s.status === 'warning').length;
    const urgent = students.filter(s => s.status === 'urgent').length;
    
    document.getElementById('normal-count').textContent = normal;
    document.getElementById('warning-count').textContent = warning;
    document.getElementById('urgent-count').textContent = urgent;
}

function showStudentDetails(student) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const interventions = getInterventions(student);
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <h3>${student.name}</h3>
            <span class="status-badge ${student.status}">
                ${student.status === 'normal' ? 'طبيعي' : student.status === 'warning' ? 'تحذير' : 'عاجل'}
            </span>
        </div>
        
        <h4 style="color: #2d7738; margin: 20px 0;">
            <i class="fas fa-chart-line"></i> المؤشرات الثلاثة
        </h4>
        <div class="indicators-grid">
            <div class="indicator-box">
                <h4><i class="fas fa-clock"></i> زمن الاستجابة</h4>
                <div class="indicator-value">${student.responseTime} ثانية</div>
                <div class="indicator-normal">معدله العادي: ${student.normalResponseTime} ثانية</div>
            </div>
            <div class="indicator-box">
                <h4><i class="fas fa-chart-bar"></i> معدل التفاعل</h4>
                <div class="indicator-value">${student.engagement}%</div>
                <div class="indicator-normal">معدله العادي: ${student.normalEngagement}%</div>
            </div>
            <div class="indicator-box">
                <h4><i class="fas fa-door-open"></i> الخروج المتكرر</h4>
                <div class="indicator-value">${student.exits} مرات</div>
                <div class="indicator-normal">معدله العادي: 0-1 مرة</div>
            </div>
        </div>
        
        <div class="diagnosis-box">
            <h4><i class="fas fa-stethoscope"></i> التشخيص</h4>
            <p>${getDiagnosis(student)}</p>
        </div>
        
        <div class="actions-list">
            <h4><i class="fas fa-tasks"></i> الإجراءات المقترحة (3)</h4>
            ${interventions.actions.map((action, i) => `
                <div class="action-item">
                    <strong>${i + 1}.</strong> ${action}
                </div>
            `).join('')}
        </div>
        
        <div class="resources-box">
            <h4><i class="fas fa-book"></i> الموارد المتاحة</h4>
            <p>${interventions.resources}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

function getDiagnosis(student) {
    if (student.responseTime > 40) {
        return 'الطالب يعاني من تأخر كبير في الاستجابة على الأسئلة، قد يكون بسبب عدم فهم المفهوم أو صعوبات تقنية.';
    }
    if (student.engagement < 50) {
        return 'انخفاض حاد في التفاعل والمشاركة، الطالب منفصل عن المحاضرة ويحتاج تدخل فوري.';
    }
    if (student.exits > 3) {
        return 'خروج متكرر من المنصة، قد يكون بسبب مشاكل تقنية أو عدم الاهتمام بالمحاضرة.';
    }
    if (student.responseTime > 25) {
        return 'تأخر ملحوظ في الاستجابة، يُنصح بمتابعة الطالب خلال الحصة.';
    }
    if (student.engagement < 70) {
        return 'تفاعل أقل من المعتاد، قد يحتاج الطالب لإعادة إشراكه في الأنشطة.';
    }
    return 'الطالب يتفاعل بشكل طبيعي، استمر في المراقبة الدورية.';
}

function getInterventions(student) {
    if (student.responseTime > 40 || (student.responseTime > 25 && student.engagement < 60)) {
        return {
            actions: [
                '(فوري) إعادة شرح المفهوم الحالي بمثال مبسط من السوق السعودي',
                '(خلال الحصة) إرسال فيديو تعليمي قصير (3 دقائق) عبر Blackboard',
                '(نفس اليوم) تخصيص تمرين تفاعلي مبسط كواجب مع فيديو شرح'
            ],
            resources: 'مكتبة فيديوهات (3-5 دقائق) + تمارين تفاعلية + بنك أسئلة محلولة'
        };
    }
    
    if (student.engagement < 50 || (student.engagement < 70 && student.exits >= 2)) {
        return {
            actions: [
                '(فوري) تكليفه بسؤال مباشر سهل لإعادة إشراكه في المحاضرة',
                '(خلال الحصة) ضمه لمجموعة عمل نشطة مع طالب قيادي',
                '(نفس اليوم) منحه دور قيادي في النشاط التالي أو المشروع الجماعي'
            ],
            resources: 'بنك أنشطة تفاعلية + مسابقات صفية + ألعاب تعليمية gamified'
        };
    }
    
    if (student.exits > 3 || (student.exits >= 2 && student.responseTime > 30)) {
        return {
            actions: [
                '(فوري) التحقق من اتصال الإنترنت + إرسال رسالة خاصة عبر Blackboard',
                '(خلال الحصة) إرسال ملخص النقاط الرئيسية التي فاتته',
                '(نفس اليوم) جدولة متابعة فردية قصيرة (5 دقائق) مع المعيد'
            ],
            resources: 'دعم تقني فوري + تسجيل الحصة للمراجعة + ملخصات PDF'
        };
    }
    
    return {
        actions: [
            '(فوري) مواصلة المراقبة الدورية',
            '(خلال الحصة) تشجيع المشاركة في الأنشطة الجماعية',
            '(نفس اليوم) إرسال واجب إضافي اختياري لتعزيز الفهم'
        ],
        resources: 'موارد إضافية للإثراء + مواد تعليمية متقدمة'
    };
}

function startSimulation() {
    if (isSimulating) return;
    
    isSimulating = true;
    currentTime = 0;
    
    document.getElementById('simulate-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'inline-block';
    document.getElementById('timer').style.display = 'inline-block';
    
    simulationInterval = setInterval(() => {
        currentTime += 5;
        document.getElementById('time-display').textContent = currentTime;
        
        if (currentTime === 5) {
            changeStudentStatus([5, 15, 25], 'warning');
            showNotification('⚠️ تنبيه: 3 طلاب انخفض تفاعلهم');
        }
        
        if (currentTime === 10) {
            changeStudentStatus([8, 22], 'urgent');
            showNotification('🚨 تنبيه عاجل: طالبان يحتاجان تدخل فوري');
        }
        
        if (currentTime === 15) {
            changeStudentStatus([12, 30, 45], 'warning');
            showNotification('⚠️ تنبيه: 3 طلاب إضافيين يحتاجون متابعة');
        }
        
        if (currentTime === 20) {
            changeStudentStatus([18], 'urgent');
            showNotification('🚨 تنبيه عاجل: طالب إضافي يحتاج تدخل فوري');
        }
        
        if (currentTime >= 25) {
            stopSimulation();
        }
    }, 2000);
}

function stopSimulation() {
    clearInterval(simulationInterval);
    isSimulating = false;
}

function resetSimulation() {
    stopSimulation();
    currentTime = 0;
    
    students.length = 0;
    students.push(...generateStudents());
    
    renderStudents();
    renderAlerts();
    updateStats();
    
    document.getElementById('simulate-btn').style.display = 'inline-block';
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
}

function changeStudentStatus(indices, newStatus) {
    indices.forEach(index => {
        if (students[index]) {
            const oldStatus = students[index].status;
            
            if (oldStatus === 'normal' || (oldStatus === 'warning' && newStatus === 'urgent')) {
                students[index].status = newStatus;
                
                if (newStatus === 'urgent') {
                    students[index].responseTime = Math.floor(Math.random() * 20) + 40;
                    students[index].engagement = Math.floor(Math.random() * 20) + 30;
                    students[index].exits = Math.floor(Math.random() * 2) + 4;
                } else if (newStatus === 'warning') {
                    students[index].responseTime = Math.floor(Math.random() * 15) + 25;
                    students[index].engagement = Math.floor(Math.random() * 20) + 50;
                    students[index].exits = Math.floor(Math.random() * 2) + 2;
                }
            }
        }
    });
    
    renderStudents();
    renderAlerts();
    updateStats();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s, slideOutRight 0.5s 3s;
        font-size: 1.1rem;
        font-weight: bold;
    `;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3500);
}
