const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Certificate PDF for completed assignment
 * @param {Object} data - Certificate data
 * @param {string} data.studentName - Student name
 * @param {string} data.courseName - Course name
 * @param {string} data.assignmentTitle - Assignment title
 * @param {number} data.score - Score obtained
 * @param {number} data.maxScore - Maximum score
 * @param {Date} data.completionDate - Completion date
 * @param {string} data.certificateId - Unique certificate ID
 * @returns {Promise<string>} - Path to generated PDF
 */
async function generateCertificate(data) {
  return new Promise((resolve, reject) => {
    try {
      const {
        studentName,
        courseName,
        assignmentTitle,
        score,
        maxScore,
        completionDate,
        certificateId
      } = data;

      // Create certificates directory if not exists
      const certsDir = path.join(__dirname, '../certificates');
      if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
      }

      const filename = `certificate_${certificateId}.pdf`;
      const filepath = path.join(certsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Calculate percentage
      const percentage = ((score / maxScore) * 100).toFixed(2);
      const grade = getGrade(percentage);

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#f8f9fa');

      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .lineWidth(3)
         .stroke('#7c2fff');

      // Inner border
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
         .lineWidth(1)
         .stroke('#cccccc');

      // Header - Certificate of Achievement
      doc.fontSize(40)
         .fillColor('#7c2fff')
         .font('Helvetica-Bold')
         .text('Certificate of Achievement', 0, 100, {
           align: 'center',
           width: doc.page.width
         });

      // Decorative line
      doc.moveTo(250, 160)
         .lineTo(doc.page.width - 250, 160)
         .lineWidth(2)
         .stroke('#7c2fff');

      // This certifies that
      doc.fontSize(16)
         .fillColor('#333333')
         .font('Helvetica')
         .text('This certifies that', 0, 200, {
           align: 'center',
           width: doc.page.width
         });

      // Student Name
      doc.fontSize(32)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text(studentName, 0, 240, {
           align: 'center',
           width: doc.page.width
         });

      // Has successfully completed
      doc.fontSize(14)
         .fillColor('#333333')
         .font('Helvetica')
         .text('has successfully completed the assignment', 0, 290, {
           align: 'center',
           width: doc.page.width
         });

      // Assignment Title
      doc.fontSize(20)
         .fillColor('#7c2fff')
         .font('Helvetica-Bold')
         .text(assignmentTitle, 0, 320, {
           align: 'center',
           width: doc.page.width
         });

      // Course Name
      doc.fontSize(16)
         .fillColor('#555555')
         .font('Helvetica-Oblique')
         .text(`from ${courseName}`, 0, 355, {
           align: 'center',
           width: doc.page.width
         });

      // Score Box
      const boxY = 400;
      const boxWidth = 200;
      const boxHeight = 60;
      const boxX = (doc.page.width - boxWidth) / 2;

      doc.rect(boxX, boxY, boxWidth, boxHeight)
         .fillAndStroke('#7c2fff', '#7c2fff');

      doc.fontSize(14)
         .fillColor('#ffffff')
         .font('Helvetica')
         .text('Score Achieved', boxX, boxY + 10, {
           width: boxWidth,
           align: 'center'
         });

      doc.fontSize(24)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text(`${score}/${maxScore} (${percentage}%)`, boxX, boxY + 30, {
           width: boxWidth,
           align: 'center'
         });

      // Grade
      doc.fontSize(18)
         .fillColor('#7c2fff')
         .font('Helvetica-Bold')
         .text(`Grade: ${grade}`, 0, boxY + boxHeight + 20, {
           align: 'center',
           width: doc.page.width
         });

      // Date and Certificate ID
      const footerY = doc.page.height - 100;
      
      doc.fontSize(12)
         .fillColor('#666666')
         .font('Helvetica')
         .text(`Date: ${new Date(completionDate).toLocaleDateString('en-IN')}`, 100, footerY);

      doc.fontSize(10)
         .fillColor('#999999')
         .text(`Certificate ID: ${certificateId}`, 0, footerY + 25, {
           align: 'center',
           width: doc.page.width
         });

      // Signature line
      const sigY = footerY - 20;
      doc.moveTo(doc.page.width - 250, sigY)
         .lineTo(doc.page.width - 100, sigY)
         .stroke('#333333');

      doc.fontSize(10)
         .fillColor('#666666')
         .text('Authorized Signature', doc.page.width - 250, sigY + 5, {
           width: 150,
           align: 'center'
         });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(`/certificates/${filename}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get grade based on percentage
 */
function getGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
}

/**
 * Generate unique certificate ID
 */
function generateCertificateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

module.exports = {
  generateCertificate,
  generateCertificateId,
  getGrade
};
