class TextExtractor {
    async extractFromFile(file) {
      const fileType = file.type;
      
      try {
        if (fileType === 'application/pdf') {
          return await this.extractFromPDF(file);
        } else if (fileType.includes('word')) {
          return await this.extractFromWord(file);
        } else {
          throw new Error('Unsupported file type');
        }
      } catch (error) {
        console.error('Text extraction error:', error);
        // Fallback: return dummy text for demo
        return this.getDummyText();
      }
    }
  
    async extractFromPDF(file) {
      // For demo purposes, we'll simulate PDF extraction
      // In real implementation, you'd use libraries like pdf-parse or PDF.js
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.getDummyText());
        }, 1000);
      });
    }
  
    async extractFromWord(file) {
      // For demo purposes, we'll simulate Word extraction
      // In real implementation, you'd use libraries like mammoth.js
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.getDummyText());
        }, 1000);
      });
    }
  
    getDummyText() {
      // Dummy CV text for demonstration
      return `
        John Doe
        Software Developer
        
        EXPERIENCE
        2021 - Present: Senior Frontend Developer at Tech Company
        - Developed web applications using React, JavaScript, and TypeScript
        - Collaborated with backend team using Node.js and MongoDB
        - Implemented responsive designs using CSS and Bootstrap
        
        2019 - 2021: Junior Web Developer at StartupCorp
        - Built user interfaces with HTML, CSS, and JavaScript
        - Worked with PHP and MySQL for backend development
        - Used Git for version control and team collaboration
        
        EDUCATION
        2019: Bachelor of Computer Science
        University of Technology
        
        SKILLS
        Programming Languages: JavaScript, TypeScript, Python, PHP
        Frontend: React, Vue.js, HTML5, CSS3, Bootstrap, Tailwind CSS
        Backend: Node.js, Express.js, Laravel
        Database: MySQL, MongoDB, PostgreSQL
        Tools: Git, Docker, VS Code, Figma
        
        CERTIFICATIONS
        - AWS Certified Developer Associate
        - Google Analytics Certified
        
        LANGUAGES
        - English (Fluent)
        - Indonesian (Native)
      `;
    }
  }
  
  export const textExtractor = new TextExtractor();