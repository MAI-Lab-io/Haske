<template>
  <div class="report-page">
    <!-- Header -->
    <header class="report-header">
      <h1>Radiology Report</h1>
      <p v-if="patientName">{{ patientName }} | {{ studyDate }}</p>
    </header>

    <!-- Patient Info Section -->
    <section class="patient-info">
      <h2>Patient Details</h2>
      <ul>
        <li><strong>ID:</strong> {{ patientId }}</li>
        <li><strong>Age:</strong> {{ patientAge }}</li>
        <li><strong>Sex:</strong> {{ patientSex }}</li>
        <li><strong>Study ID:</strong> {{ studyId }}</li>
        <li><strong>Study Date:</strong> {{ studyDate }}</li>
      </ul>
    </section>

    <!-- Patient Images Section -->
    <section class="image-viewer">
      <h2>Patient Images</h2>

      <div class="image-grid">
        <!-- Left Panel: Original Image -->
        <div class="image-panel">
          <h3>Original Image</h3>
          <div v-if="studyId" class="ohif-viewer-container">
            <iframe
              :src="ohifViewerUrl"
              width="100%"
              height="400"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
          <div v-else class="no-images">
            <p>No original image available.</p>
          </div>
        </div>

        <!-- Right Panel: Segmentation / Prediction -->
        <div class="image-panel">
          <h3>Segmentation / Predicted Mask</h3>
          <div v-if="predictedImageUrl">
            <img
              :src="predictedImageUrl"
              alt="Predicted Mask"
              class="side-image"
            />
          </div>
          <div v-else class="no-images">
            <p>No prediction available.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Radiology Report Section -->
    <section class="radiology-report">
      <h2>Report Summary</h2>
      <textarea
        v-model="reportText"
        placeholder="Type or edit radiology report here..."
      ></textarea>
    </section>

    <!-- Notes Section -->
    <section class="notes-section">
      <h2>Additional Notes</h2>
      <textarea
        v-model="notes"
        placeholder="Add notes, recommendations, or comments..."
      ></textarea>
    </section>

    <!-- Actions Section -->
    <section class="actions">
      <button class="save-btn" @click="saveReport">Save Report</button>
      <button class="export-btn" @click="exportReport">Export as PDF</button>
    </section>
  </div>
</template>

<script>
export default {
  name: "ReportPage",
  data() {
    return {
      patientName: "",
      patientId: "",
      patientAge: "",
      patientSex: "",
      studyId: "",
      studyDate: "",
      ohifViewerUrl: "",
      reportText: "",
      notes: "",
      predictedImageUrl: "", // ✅ for segmentation output
    };
  },
  mounted() {
    this.fetchPatientDetails();
  },
  methods: {
    async fetchPatientDetails() {
      try {
        const response = await fetch("https://haske.online:8090/api/patient");
        const data = await response.json();

        this.patientName = data.name || "Unknown";
        this.patientId = data.id || "N/A";
        this.patientAge = data.age || "N/A";
        this.patientSex = data.sex || "N/A";
        this.studyId = data.studyId || "N/A";
        this.studyDate = data.studyDate || "N/A";
        this.ohifViewerUrl = `https://haske.online:8080/viewer/${this.studyId}`;

        // ✅ Try loading predicted segmentation image
        try {
          const segResponse = await fetch(
            `https://haske.online:8090/result/${this.studyId}/prediction.png`
          );
          if (segResponse.ok) {
            this.predictedImageUrl = `https://haske.online:8090/result/${this.studyId}/prediction.png`;
          }
        } catch (error) {
          console.warn("No predicted image found for this study.");
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    },

    saveReport() {
      console.log("Saving report...");
      // Add save logic (e.g., POST to backend)
      alert("Report saved successfully!");
    },

    exportReport() {
      console.log("Exporting report as PDF...");
      // Add PDF export logic
      alert("Report exported successfully!");
    },
  },
};
</script>

<style scoped>
.report-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  background: #f9fafb;
  font-family: "Inter", sans-serif;
  color: #333;
}

.report-header {
  text-align: center;
  margin-bottom: 20px;
}

.report-header h1 {
  font-size: 28px;
  color: #1e40af;
}

.patient-info,
.radiology-report,
.notes-section,
.actions {
  background: #fff;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.patient-info h2,
.radiology-report h2,
.notes-section h2,
.image-viewer h2 {
  color: #1e3a8a;
  font-size: 20px;
  margin-bottom: 10px;
}

.patient-info ul {
  list-style: none;
  padding: 0;
}

.patient-info li {
  margin-bottom: 6px;
}

textarea {
  width: 100%;
  min-height: 120px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 15px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn,
.export-btn {
  background: #1e40af;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
}

.export-btn {
  background: #059669;
}

.save-btn:hover {
  background: #1d4ed8;
}

.export-btn:hover {
  background: #047857;
}

/* ===================== IMAGE VIEWER ===================== */
.image-viewer {
  margin-top: 20px;
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.image-grid {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.image-panel {
  flex: 1;
  min-width: 45%;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.image-panel h3 {
  text-align: center;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.side-image {
  width: 100%;
  height: 400px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.no-images {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-style: italic;
  color: #888;
}

.ohif-viewer-container iframe {
  border-radius: 8px;
  border: 1px solid #ddd;
}
</style>

