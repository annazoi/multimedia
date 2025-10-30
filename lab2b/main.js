let processor = {
	// Φόρτωση video, canvas και εικόνας background
	doLoad: function () {
		this.video = document.getElementById('video');

		// Πρώτο canvas για ανάγνωση frame από το video
		this.c1 = document.getElementById('c1');
		this.ctx1 = this.c1.getContext('2d');

		// Δεύτερο canvas για εμφάνιση του τελικού αποτελέσματος
		this.c2 = document.getElementById('c2');
		this.ctx2 = this.c2.getContext('2d');

		// Φόρτωση εικόνας φόντου
		this.bg = new Image();
		this.bg.src = 'background.jpg';

		let self = this;

		// Όταν ξεκινήσει η αναπαραγωγή του video
		this.video.addEventListener(
			'play',
			function () {
				// Ίδιες διαστάσεις video και canvas
				self.width = self.video.videoWidth;
				self.height = self.video.videoHeight;
				self.c1.width = self.c2.width = self.width;
				self.c1.height = self.c2.height = self.height;

				// Εκκίνηση επεξεργασίας καρέ
				self.timerCallback();
			},
			false
		);
	},

	// Συνεχόμενη επεξεργασία frames
	timerCallback: function () {
		if (this.video.paused || this.video.ended) return;
		this.computeFrame();
		// Κλήση της ίδιας συνάρτησης για το επόμενο frame
		setTimeout(() => this.timerCallback(), 0);
	},

	// Επεξεργασία chroma key
	computeFrame: function () {
		// Σχεδιάζουμε το video στο πρώτο canvas
		this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
		// Παίρνουμε τα pixel του frame
		let frame = this.ctx1.getImageData(0, 0, this.width, this.height);

		// Ζωγραφίζουμε το background στο δεύτερο canvas
		this.ctx2.drawImage(this.bg, 0, 0, this.width, this.height);

		// Παίρνουμε τα pixels της εικόνας background
		let bgFrame = this.ctx2.getImageData(0, 0, this.width, this.height);
		let l = frame.data.length / 4;

		// Για κάθε pixel του frame
		for (let i = 0; i < l; i++) {
			let r = frame.data[i * 4 + 0];
			let g = frame.data[i * 4 + 1];
			let b = frame.data[i * 4 + 2];

			// Αν εντοπιστεί πράσινο pixel, γίνεται αντικατάσταση
			if (g > 120 && r < 100 && b < 100) {
				// Αντικατάσταση με background
				frame.data[i * 4 + 0] = bgFrame.data[i * 4 + 0];
				frame.data[i * 4 + 1] = bgFrame.data[i * 4 + 1];
				frame.data[i * 4 + 2] = bgFrame.data[i * 4 + 2];
			}
		}

		// Προβολή του επεξεργασμένου frame
		this.ctx2.putImageData(frame, 0, 0);
	},
};
