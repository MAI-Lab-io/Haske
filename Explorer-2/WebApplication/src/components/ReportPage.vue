<template>
  <div class="report-page">
    <header>
      <h1> Report</h1>
    </header>

    <!-- Row 1: Patient Information -->
    <section class="full-width-section patient-info">
      <h2>Patient Information</h2>
      <div class="patient-row">
        <div class="form-group">
          <label><i class="fas fa-user"></i> Name</label>
          <span class="patient-detail">{{ patientName || manualPatientName }}</span>
          <input v-if="!patientName" type="text" v-model="manualPatientName" placeholder="Enter patient name" />
        </div>
        <div class="form-group">
          <label><i class="fas fa-id-badge"></i> Patient ID</label>
          <span class="patient-detail">{{ patientId || 'N/A' }}</span>
        </div>
        <div class="form-group">
          <label><i class="fas fa-calendar-alt"></i> Date of Birth</label>
          <span class="patient-detail">{{ patientDob || manualPatientDob }}</span>
          <input v-if="!patientDob" type="date" v-model="manualPatientDob" />
        </div>
        <div class="form-group">
          <label><i class="fas fa-venus-mars"></i> Gender</label>
          <span class="patient-detail">{{ patientGender || manualPatientGender }}</span>
          <input v-if="!patientGender" type="text" v-model="manualPatientGender" placeholder="Enter gender" />
        </div>
      </div>
      <div class="patient-row">
        <div class="form-group">
          <label><i class="fas fa-calendar-day"></i> Study Date</label>
          <span class="patient-detail">{{ studyDate || manualStudyDate }}</span>
          <input v-if="!studyDate" type="date" v-model="manualStudyDate" />
        </div>
        <div class="form-group">
          <label><i class="fas fa-stethoscope"></i> Study Type</label>
          <span class="patient-detail">{{ studyType || manualStudyType }}</span>
          <input v-if="!studyType" type="text" v-model="manualStudyType" placeholder="Enter study type" />
        </div>
        
          <div class="form-group">
          <label><i class="fas fa-stethoscope"></i> Modality</label>
          <span class="patient-detail">{{ Modality|| manualModality }}</span>
          <input v-if="!Modality" type="text" v-model="manualModality" placeholder="Enter Modality" />
        </div>
        
        
         <div class="form-group">
          <label><i class="fas fa-stethoscope"></i> Body Part</label>
          <span class="patient-detail">{{ BodyPartExamined|| manualBodyPartExamined }}</span>
          <input v-if="!BodyPartExamined" type="text" v-model="manualBodyPartExamined" placeholder="Enter Modality" />
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-stethoscope"></i> Institution Name </label>
          <span class="patient-detail">{{ InstitutionName || manualInstitutionName  }}</span>
          <input v-if="!InstitutionName " type="text" v-model="manualInstitutionName " placeholder="Enter Institution Name " />
        </div>
  
        
        <div class="form-group">
          <label><i class="fas fa-stethoscope"></i> Referring Physician</label>
          <span class="patient-detail">{{ referringPhysicianName }}</span>
        </div>
      </div>
    </section>

    <!-- Row 2: Report Content -->
    <section class="full-width-section report-content">
      <h2>Report Content</h2>
      <div class="form-column">
        <div class="form-group">
          <textarea v-model="clinicalindications" placeholder="Enter Clinical Indications"></textarea>
        </div>
        <div class="form-group">
          <textarea v-model="procedure" placeholder="Enter Procedure"></textarea>
        </div>
        <div class="form-group">
          <textarea v-model="technique" placeholder="Enter Technique"></textarea>
        </div>
        <div class="form-group">
          <textarea v-model="findings" placeholder="Enter Findings"></textarea>
        </div>
        <div class="form-group">
          <textarea v-model="overallImpression" placeholder="Overall Impression"></textarea>
        </div>
      </div>
    </section>

    <!-- Row 3: Radiologist Section -->
    <section class="full-width-section radiologist-info">
      <h2>Radiologist Details</h2>
      <div class="form-group">
        <textarea v-model="radiologistName" placeholder="Radiologist Name"></textarea>
      </div>

      <div class="signature-section">
        <label>Signature</label>
        <div class="signature-container">
          <canvas id="signature-pad" width="300" height="150" style="border: 1px solid #ccc;"></canvas>
          <div class="signature-actions">
            <button @click="clearSignature" class="action-btn">Clear Signature</button>
            <input type="file" @change="uploadSignature" accept="image/*" class="browse-button" />
          </div>
        </div>

        <div class="form-group">
          <label><i class="fas fa-calendar-alt"></i> Signature Date</label>
          <input type="date" v-model="signatureDate" class="date-input" />
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <section class="actions">
      <button @click="saveReport" class="action-btn">Save Report</button>
      <button @click="downloadReportAsPDF" class="action-btn secondary">Download Report</button>
    </section>
  </div>
</template>


<script>
import api from "../orthancApi"; // Ensure your API is correctly imported
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import SignaturePad from 'signature_pad';
import { saveAs } from "file-saver";
import logo from '../assets/images/haske.png'; // Update the path as necessary

export default {
  props: ['id', 'name', 'birthDate', 'sex'],
  data() {
    return {
      // Patient and study details
      patientName: this.name || '',
      patientId: this.id || '',
      patientDob: this.birthDate || '',
      patientGender: this.sex || '',
      studyDate: '',
      studyType: '',
      Modality: '',
      BodyPartExamined: '',
      InstitutionName: '',
      ReferringPhysicianName: '',
      clinicalindications: '',
      procedure: '',
      technique: '',
      findings: '',
      overallImpression: '',
      radiologistName: '',
      signaturePad: null,
      signatureImage: null,
      signatureDate: '',
     
      // Manual input for patient data if missing
      manualPatientName: '',
      manualPatientDob: '',
      manualPatientGender: '',
      manualStudyDate: '',
      manualStudyType: '',
      manualModality: '',
      manualBodyPartExamined: '',
      manualInstitutionName: '',     
      
    };
  },
  methods: {
   formatDate(dateStr) {
      if (!dateStr) return '';
      const [year, month, day] = [dateStr.slice(0, 4), dateStr.slice(4, 6), dateStr.slice(6)];
      return `${year}/${month}/${day}`;
    },
    formatName(name) {
      // Remove special characters and extra spaces
      return name.replace(/[^\w\s]|_/g, ' ').replace(/\s+/g, ' ').trim();
    },

    // Fetch patient details
    async fetchPatientDetails() {
    const orthancId = this.$route.params.id;
    try {
      // Fetch study data from Orthanc
      const studyData = await api.getStudy(orthancId);
      const StudySeriesArray = await api.getStudySeries(orthancId);
      console.log('Study Series:', StudySeriesArray);

      // Check if there are any series and get the first one
      const StudySeries = StudySeriesArray.length > 0 ? StudySeriesArray[0] : null;

      // Set patient details from the fetched data
      this.patientName = this.formatName(studyData.PatientMainDicomTags.PatientName) || '';
      this.patientId = studyData.PatientMainDicomTags.PatientID || '';
      this.patientDob = this.formatDate(studyData.PatientMainDicomTags.PatientBirthDate) || '';
      this.patientGender = studyData.PatientMainDicomTags.PatientSex || '';
      this.studyDate = this.formatDate(studyData.MainDicomTags.StudyDate) || '';
      this.studyType = studyData.MainDicomTags.StudyDescription || '';
      this.ReferringPhysicianName = this.formatName(studyData.MainDicomTags.ReferringPhysicianName) || '';

      // Ensure StudySeries is not null before accessing its properties
      if (StudySeries) {
        this.Modality = StudySeries.MainDicomTags.Modality || '';
        this.BodyPartExamined = StudySeries.MainDicomTags.BodyPartExamined || '';
      } else {
        this.Modality = '';
        this.BodyPartExamined = '';
      }

      this.InstitutionName = studyData.MainDicomTags.InstitutionName || '';
      
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  },
  
  clearSignature() {
      this.signaturePad.clear();
      this.signatureImage = null; // Reset uploaded image
    },
    uploadSignature(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          this.signaturePad.clear(); // Clear previous signature
          this.signaturePad.fromDataURL(img.src);
        };
      };
      reader.readAsDataURL(file);
    },

    // Save report to local storage
    saveReport() {
      const orthancId = this.$route.params.id;
      const reportData = {
        patientName: this.patientName || this.manualPatientName,
        patientId: this.patientId,
        patientDob: this.patientDob || this.manualPatientDob,
        patientGender: this.patientGender || this.manualPatientGender,
        studyDate: this.studyDate || this.manualStudyDate,
        studyType: this.studyType || this.manualStudyType,
        Modality: this.Modality || this.manualModality,
        BodyPartExamined: this.BodyPartExamined || this.manualBodyPartExamined,
        InstitutionName: this.InstitutionName || this.manualInstitutionName,
        clinicalindications: this.clinicalindications,
        procedure: this.procedure,
        technique: this.technique,
        findings: this.findings,
        overallImpression: this.overallImpression,
        radiologistName: this.radiologistName,
        signature: this.signaturePad.toDataURL(),
        signatureDate: this.signatureDate,
        
      };
      
      localStorage.setItem(`report_${orthancId}`, JSON.stringify(reportData));
      alert('Report saved successfully!');
    },

    // Load report data from local storage
   loadReport() {
  const orthancId = this.$route.params.id;
  const reportData = JSON.parse(localStorage.getItem(`report_${orthancId}`));
  if (reportData) {
    this.patientName = reportData.patientName || '';
    this.patientDob = reportData.patientDob || '';
    this.patientGender = reportData.patientGender || '';
    this.studyDate = reportData.studyDate || '';
    this.studyType = reportData.studyType || '';
    this.Modality = reportData.Modality || '';
    this.BodyPartExamined = reportData.BodyPartExamined || '';
    this.InstitutionName = reportData.InstitutionName || '';
    this.ReferringPhysicianName = reportData.ReferringPhysicianName || '';
    this.clinicalindications = reportData.clinicalindications || '';
    this.procedure = reportData.procedure || '';
    this.technique = reportData.technique || '';
    this.findings = reportData.findings || '';
    this.overallImpression = reportData.overallImpression || '';
    this.radiologistName = reportData.radiologistName || '';
     // Load signature
        if (reportData.signature) {
          const img = new Image();
          img.src = reportData.signature;
          img.onload = () => {
            this.signaturePad.clear();
            this.signaturePad.fromDataURL(img.src);}
          };
    this.signatureDate = reportData.signatureDate || '';
    
    // Set manual input fields as well
    this.manualPatientName = this.patientName;
    this.manualPatientDob = this.patientDob;
    this.manualPatientGender = this.patientGender;
    this.manualStudyDate = this.studyDate;
    this.manualStudyType = this.studyType;
    this.manualModality = this.Modality;
    this.manualBodyPartExamined = this.BodyPartExamined;
    this.manualInstitutionName = this.InstitutionName;
   

  }
},

// Function to download report as Word document
downloadReportAsWord() {
  // Create a new Word document
  const doc = new Document();

  // Helper function to create a paragraph
  const createParagraph = (text, bold = false, italic = false, alignment = AlignmentType.LEFT) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          bold: bold,
          italics: italic,
        }),
      ],
      alignment: alignment,
    });
  };

  // Adding content to the document
  doc.addSection({
    properties: {},
    children: [
      // Header with logo (in Word, you can’t directly add images using docx.js, so you’d need to add a placeholder or workaround)
      createParagraph("Medical Imaging Report", true, false, AlignmentType.CENTER),
      
      // Patient Information Section
      createParagraph("Patient Information:", true, false, AlignmentType.CENTER),
      createParagraph(`Patient Name: ${this.patientName}`),
      createParagraph(`Patient ID: ${this.patientId}`),
      createParagraph(`Date of Birth: ${this.patientDob}`),
      createParagraph(`Gender: ${this.patientGender}`),
      createParagraph(`Institution Name: ${this.InstitutionName}`),
      createParagraph(`Referring Physician: ${this.ReferringPhysicianName}`),
      
      // Examination Details Section
      createParagraph("Examination Details:", true, false, AlignmentType.CENTER),
      createParagraph(`Body Parts: ${this.BodyPartExamined}`),
      createParagraph(`Modality: ${this.Modality}`),
      createParagraph(`Study Date: ${this.studyDate}`),
      createParagraph(`Study Type: ${this.studyType}`),
      
      // Report Content Section
      createParagraph("Report Content:", true, false, AlignmentType.CENTER),
      createParagraph(`Clinical Indications: ${this.clinicalindications}`),
      createParagraph(`Procedure: ${this.procedure}`),
      createParagraph(`Technique: ${this.technique}`),
      createParagraph(`Findings: ${this.findings}`),
      createParagraph(`Overall Impression: ${this.overallImpression}`),
      
      // Radiologist Signature Section
      createParagraph("Signed:", true, false, AlignmentType.CENTER),
      createParagraph(`Name: ${this.radiologistName}`),
      createParagraph(`Signature Date: ${this.signatureDate}`),
    ],
  });

  // Create the Word document and trigger download
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${this.patientName}_Medical_Imaging_Report.docx`);
  });
},
downloadReportAsPDF() {
  const doc = new jsPDF();

  // Load logo image
  const img = new Image();
  img.src = logo; // Ensure logo is accessible at this path
  img.onload = () => {
    let pageNumber = 1; // Initialize the page number
    let totalPages = 0; // Placeholder for total pages

    const addHeader = () => {
      doc.addImage(img, 'PNG', 85, 5, 40, 10); // Add logo
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Report", 105, 30, null, null, "center"); // Center the title
      doc.setDrawColor(0, 0, 0);
      doc.line(20, 35, 190, 35); // Horizontal line under title
    };

    const addFooter = () => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("sourced by Haske.", 175, 290);
      
      doc.setFontSize(12);
      pageNumber++; // Increment page number for the next page
    };

    const addNewPage = () => {
      doc.addPage();
      addHeader();
      currentY = 2; // Reset Y position after adding a new page
      doc.setFontSize(12);
      addFooter(); // Add footer with page number
    };

    // Add Header and Footer for the first page
    addHeader();
    addFooter();

    let currentY = 40; // Starting Y position for the content
    const detailsSpacing = 7;

    // Patient Information Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const patientInfoTitle = "Patient Information:";
    doc.text(patientInfoTitle, 105, currentY, null, null, "center"); // Centered
    currentY += 5;
    doc.line(20, currentY, 190, currentY);
    currentY += 10;

    // Patient Details
    const patientDetails = [
      { label: "Patient Name:", value: this.patientName },
      { label: "Patient ID:", value: this.patientId },
      { label: "Date of Birth:", value: this.patientDob },
      { label: "Gender:", value: this.patientGender },
      { label: "Institution Name:", value: this.InstitutionName },
      { label: "Referring Physician:", value: this.ReferringPhysicianName }
    ];

    patientDetails.forEach(detail => {
      if (this.checkSpace(doc, currentY, detailsSpacing)) addNewPage();
      doc.setFont("helvetica", "bold");
      doc.text(detail.label, 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(detail.value, 60, currentY);
      currentY += detailsSpacing;
    });

    // Examination Details Section
    currentY += 5;
    doc.line(20, currentY - 5, 190, currentY-5); // Horizontal line under section title
    doc.setFont("helvetica", "bold");
    doc.text("Examination Details:", 105, currentY, null, null, "center");
    doc.line(20, currentY + 5, 190, currentY+5);
    currentY += 15;

    const examDetails = [
      { label: "Body Parts:", value: this.BodyPartExamined, x: 20 },
      { label: "Modality:", value: this.Modality, x: 20 },
      { label: "Study Date:", value: this.studyDate, x: 110 },
      { label: "Study Type:", value: this.studyType, x: 110 }
    ];

    let initialY = currentY;

    examDetails.slice(0, 2).forEach(detail => {
      if (this.checkSpace(doc, currentY, detailsSpacing)) addNewPage();
      doc.setFont("helvetica", "bold");
      doc.text(detail.label, detail.x, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(detail.value, detail.x + 40, currentY);
      currentY += detailsSpacing;
    });

    currentY = initialY;
    examDetails.slice(2).forEach(detail => {
      if (this.checkSpace(doc, currentY, detailsSpacing)) addNewPage();
      doc.setFont("helvetica", "bold");
      doc.text(detail.label, detail.x, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(detail.value, detail.x + 40, currentY);
      currentY += detailsSpacing;
    });

    // Report Content Section
    doc.line(20, currentY, 190, currentY);
    currentY += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Report Content:", 105, currentY, null, null, "center");
    currentY += 5;
    doc.line(20, currentY, 190, currentY);
    currentY += 10;

    const reportSections = [
      { label: "Clinical Indications", value: this.clinicalindications },
      { label: "Procedure", value: this.procedure },
      { label: "Technique", value: this.technique },
      { label: "Findings", value: this.findings },
      { label: "Overall Impression", value: this.overallImpression }
    ];

    reportSections.forEach(section => {
      if (this.checkSpace(doc, currentY, 20)) addNewPage();
      doc.setFont("helvetica", "bold");
      doc.text(section.label, 20, currentY);
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(section.value, 175);
      currentY += 5;

      splitText.forEach((line, index) => {
        if (this.checkSpace(doc, currentY + (index*5), detailsSpacing)) addNewPage();
        doc.setFont("helvetica", "normal");
        doc.text(line, 20, currentY + (index * 6));
      });
      currentY += (splitText.length * 6) + detailsSpacing;
    });

    // Radiologist Details Section
    if (this.checkSpace(doc, currentY, 50)) addNewPage();
    doc.setFont("helvetica", "bold");
    doc.text("Signed:", 105, currentY, null, null, "center");
    currentY += 5;
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    doc.text("Name:", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(this.radiologistName, 40, currentY);
    currentY += 10;

    // Signature
    if (!this.signaturePad.isEmpty()) {
      const signatureDataUrl = this.signaturePad.toDataURL();
      doc.addImage(signatureDataUrl, 'PNG', 20, currentY-5, 50, 20);
      currentY += 25;
    }

       // Signature Date
    doc.setFont("helvetica", "bold");
    doc.text("Signature Date:", 20, currentY); // Bold for "Signature Date"
    doc.setFont("helvetica", "normal");
    doc.text(this.signatureDate, 58, currentY); // Normal for the actual date
    currentY += 10;

    // Now calculate the total number of pages and update the page numbering
    totalPages = doc.internal.getNumberOfPages();

    // Loop through all pages and add the correct page numbers
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(`Page ${i} of ${totalPages}`, 105, 290, null, null, "center"); // Page X of Y
    }

    // Save the PDF
    doc.save(`${this.patientName}_Medical_Imaging_Report.pdf`);
  };

  img.onerror = () => {
    console.error('Error loading logo image.');
  };
},


checkSpace(doc, currentY, spacing) {
  const pageHeight = doc.internal.pageSize.getHeight();
  return (currentY + spacing) > (pageHeight - 20); // Leaving 20 units for bottom margin
}


  },
  mounted() {
    const canvas = document.getElementById('signature-pad');
    this.signaturePad = new SignaturePad(canvas);
    // Load report data if available
    this.loadReport();
    // Fetch patient details if applicable
    this.fetchPatientDetails();
  },
};
</script>


<style scoped>
/* Global styling for dark theme with colorful accents */
.report-page {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 30px;
  padding: 20px;
  max-width: 1550px;
  margin: 0 auto;
  font-family: 'Helvetica Neue', sans-serif;
  color: #fff;
  background-color: #2e353d;
}

h1 {
  font-size: 48px;
  text-align: center;
  color: #ffffff;
  margin-bottom: 15px;
  font-weight: bold;
  
}

h2 {
  font-size: 24px;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.full-width-section {
  grid-column: span 3;
  background: #3c3c3c;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #555;
  margin-bottom: 20px;
}

.patient-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 10px;
  flex: 1 1 20%; 
  margin-right: 1rem;
}

.form-group:last-child {
  margin-right: 0; /* Remove margin for the last child */
}

.patient-detail {
  display: block; /* Ensure the detail is displayed as a block element */
  color: #ffffff; /* Adjust color as needed */
  margin-top: 0.25rem; /* Space between label and detail */
}

.form-column {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 16px;
  color: #fff;
  margin-bottom: 5px;
  font-weight: bold;
}

.signature-section {
  margin-top: 20px;
}

.signature-container {
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: center; /* Center align canvas */
  margin-bottom: 15px;
}

.signature-actions {
  display: flex;
  justify-content: space-between; /* Space between buttons */
  width: 100%; /* Full width for alignment */
  margin-top: 10px;
}


input[type="text"], textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #888;
  border-radius: 4px;
  background-color: #444;
  color: #fff;
  transition: all 0.3s ease;
  resize: vertical;
}

input[type="text"]:hover, textarea:hover {
  border-color: #ffcc00;
}

textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  overflow-y: auto;
}

.actions {
  display: center;
  text-align: center;
  margin-top: 30px;
  gap: 10px;
}

.action-btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  background-color: #ffcc00;
  color: #2c2c2c;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin-right: 10px;
}

.browse-button {
  margin-left: 10px; /* Space between button and input */
}

.date-input {
  width: 100%; /* Full width for date input */
  padding: 5px; /* Padding for better spacing */
}

.action-btn.secondary {
  background-color: #aaa;
}

.action-btn:hover {
  background-color: #e6b800;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .patient-row {
    flex-direction: column;
  }
}
</style>

