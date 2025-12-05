const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF resume from resume content
 * @param {Object} resumeContent - The resume content object
 * @param {string} outputPath - Optional output file path
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePDF(resumeContent, outputPath = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        if (outputPath) {
          fs.writeFileSync(outputPath, pdfBuffer);
        }
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header - Name and Contact Info
      doc.fontSize(20).font('Helvetica-Bold').text(resumeContent.personalInfo?.name || 'Your Name', {
        align: 'center',
      });
      doc.moveDown(0.5);

      // Contact information
      const contactInfo = [];
      if (resumeContent.personalInfo?.email) contactInfo.push(resumeContent.personalInfo.email);
      if (resumeContent.personalInfo?.phone) contactInfo.push(resumeContent.personalInfo.phone);
      if (resumeContent.personalInfo?.linkedin) contactInfo.push(resumeContent.personalInfo.linkedin);

      if (contactInfo.length > 0) {
        doc.fontSize(10).font('Helvetica').text(contactInfo.join(' | '), {
          align: 'center',
        });
        doc.moveDown(1);
      }

      // Professional Summary
      if (resumeContent.summary) {
        doc.fontSize(12).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY', {
          underline: true,
        });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(resumeContent.summary, {
          align: 'left',
        });
        doc.moveDown(1);
      }

      // Experience
      if (resumeContent.experience && resumeContent.experience.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('PROFESSIONAL EXPERIENCE', {
          underline: true,
        });
        doc.moveDown(0.5);

        resumeContent.experience.forEach((exp) => {
          // Company and Role
          doc.fontSize(11).font('Helvetica-Bold').text(exp.role || 'Position', {
            continued: false,
          });
          doc.fontSize(10).font('Helvetica').text(exp.company || 'Company', {
            continued: true,
          });
          if (exp.duration) {
            doc.fontSize(10).font('Helvetica-Oblique').text(` | ${exp.duration}`, {
              continued: false,
            });
          }
          doc.moveDown(0.3);

          // Bullets
          if (exp.bullets && Array.isArray(exp.bullets)) {
            exp.bullets.forEach((bullet) => {
              doc.fontSize(9).font('Helvetica').text(`• ${bullet}`, {
                indent: 20,
                align: 'left',
              });
            });
          }
          doc.moveDown(0.5);
        });
      }

      // Skills
      if (resumeContent.skills) {
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('SKILLS', {
          underline: true,
        });
        doc.moveDown(0.3);

        if (resumeContent.skills.technical && resumeContent.skills.technical.length > 0) {
          doc.fontSize(10).font('Helvetica-Bold').text('Technical: ', {
            continued: true,
          });
          doc.fontSize(10).font('Helvetica').text(resumeContent.skills.technical.join(', '));
        }

        if (resumeContent.skills.soft && resumeContent.skills.soft.length > 0) {
          doc.moveDown(0.2);
          doc.fontSize(10).font('Helvetica-Bold').text('Soft Skills: ', {
            continued: true,
          });
          doc.fontSize(10).font('Helvetica').text(resumeContent.skills.soft.join(', '));
        }

        if (resumeContent.skills.tools && resumeContent.skills.tools.length > 0) {
          doc.moveDown(0.2);
          doc.fontSize(10).font('Helvetica-Bold').text('Tools: ', {
            continued: true,
          });
          doc.fontSize(10).font('Helvetica').text(resumeContent.skills.tools.join(', '));
        }
        doc.moveDown(1);
      }

      // Education
      if (resumeContent.education && resumeContent.education.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('EDUCATION', {
          underline: true,
        });
        doc.moveDown(0.5);

        resumeContent.education.forEach((edu) => {
          doc.fontSize(10).font('Helvetica-Bold').text(edu.degree || 'Degree', {
            continued: false,
          });
          doc.fontSize(10).font('Helvetica').text(edu.institution || 'Institution', {
            continued: true,
          });
          if (edu.year) {
            doc.fontSize(10).font('Helvetica-Oblique').text(` | ${edu.year}`, {
              continued: false,
            });
          }
          if (edu.details) {
            doc.moveDown(0.2);
            doc.fontSize(9).font('Helvetica').text(edu.details, {
              indent: 20,
            });
          }
          doc.moveDown(0.3);
        });
      }

      // Additional Sections
      if (resumeContent.additionalSections && resumeContent.additionalSections.length > 0) {
        resumeContent.additionalSections.forEach((section) => {
          doc.moveDown(0.5);
          doc.fontSize(12).font('Helvetica-Bold').text(section.title.toUpperCase(), {
            underline: true,
          });
          doc.moveDown(0.3);

          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item) => {
              doc.fontSize(10).font('Helvetica').text(`• ${item}`, {
                indent: 20,
              });
            });
          }
        });
      }

      doc.end();
    } catch (error) {
      reject(new Error(`Error generating PDF: ${error.message}`));
    }
  });
}

/**
 * Generates a Word document (.docx) resume from resume content
 * @param {Object} resumeContent - The resume content object
 * @param {string} outputPath - Optional output file path
 * @returns {Promise<Buffer>} - DOCX buffer
 */
async function generateDOCX(resumeContent, outputPath = null) {
  try {
    const children = [];

    // Header - Name
    if (resumeContent.personalInfo?.name) {
      children.push(
        new Paragraph({
          text: resumeContent.personalInfo.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    // Contact Information
    const contactInfo = [];
    if (resumeContent.personalInfo?.email) contactInfo.push(resumeContent.personalInfo.email);
    if (resumeContent.personalInfo?.phone) contactInfo.push(resumeContent.personalInfo.phone);
    if (resumeContent.personalInfo?.linkedin) contactInfo.push(resumeContent.personalInfo.linkedin);

    if (contactInfo.length > 0) {
      children.push(
        new Paragraph({
          text: contactInfo.join(' | '),
          alignment: AlignmentType.CENTER,
        })
      );
      children.push(new Paragraph({ text: '' })); // Spacing
    }

    // Professional Summary
    if (resumeContent.summary) {
      children.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
        })
      );
      children.push(
        new Paragraph({
          text: resumeContent.summary,
        })
      );
      children.push(new Paragraph({ text: '' })); // Spacing
    }

    // Experience
    if (resumeContent.experience && resumeContent.experience.length > 0) {
      children.push(
        new Paragraph({
          text: 'PROFESSIONAL EXPERIENCE',
          heading: HeadingLevel.HEADING_2,
        })
      );

      resumeContent.experience.forEach((exp) => {
        // Role, Company, Duration
        const expHeader = [];
        if (exp.role) expHeader.push(new TextRun({ text: exp.role, bold: true }));
        if (exp.company) {
          expHeader.push(new TextRun({ text: ` - ${exp.company}` }));
        }
        if (exp.duration) {
          expHeader.push(new TextRun({ text: ` | ${exp.duration}`, italics: true }));
        }

        children.push(new Paragraph({ children: expHeader }));

        // Bullets
        if (exp.bullets && Array.isArray(exp.bullets)) {
          exp.bullets.forEach((bullet) => {
            children.push(
              new Paragraph({
                text: `• ${bullet}`,
                indent: { left: 400 },
              })
            );
          });
        }
        children.push(new Paragraph({ text: '' })); // Spacing
      });
    }

    // Skills
    if (resumeContent.skills) {
      children.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
        })
      );

      if (resumeContent.skills.technical && resumeContent.skills.technical.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Technical: ', bold: true }),
              new TextRun({ text: resumeContent.skills.technical.join(', ') }),
            ],
          })
        );
      }

      if (resumeContent.skills.soft && resumeContent.skills.soft.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Soft Skills: ', bold: true }),
              new TextRun({ text: resumeContent.skills.soft.join(', ') }),
            ],
          })
        );
      }

      if (resumeContent.skills.tools && resumeContent.skills.tools.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Tools: ', bold: true }),
              new TextRun({ text: resumeContent.skills.tools.join(', ') }),
            ],
          })
        );
      }
      children.push(new Paragraph({ text: '' })); // Spacing
    }

    // Education
    if (resumeContent.education && resumeContent.education.length > 0) {
      children.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
        })
      );

      resumeContent.education.forEach((edu) => {
        const eduText = [];
        if (edu.degree) eduText.push(new TextRun({ text: edu.degree, bold: true }));
        if (edu.institution) {
          eduText.push(new TextRun({ text: ` - ${edu.institution}` }));
        }
        if (edu.year) {
          eduText.push(new TextRun({ text: ` | ${edu.year}`, italics: true }));
        }

        children.push(new Paragraph({ children: eduText }));

        if (edu.details) {
          children.push(
            new Paragraph({
              text: edu.details,
              indent: { left: 400 },
            })
          );
        }
        children.push(new Paragraph({ text: '' })); // Spacing
      });
    }

    // Additional Sections
    if (resumeContent.additionalSections && resumeContent.additionalSections.length > 0) {
      resumeContent.additionalSections.forEach((section) => {
        children.push(
          new Paragraph({
            text: section.title.toUpperCase(),
            heading: HeadingLevel.HEADING_2,
          })
        );

        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item) => {
            children.push(
              new Paragraph({
                text: `• ${item}`,
                indent: { left: 400 },
              })
            );
          });
        }
        children.push(new Paragraph({ text: '' })); // Spacing
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    if (outputPath) {
      fs.writeFileSync(outputPath, buffer);
    }

    return buffer;
  } catch (error) {
    throw new Error(`Error generating DOCX: ${error.message}`);
  }
}

/**
 * Generates a plain text resume from resume content
 * @param {Object} resumeContent - The resume content object
 * @param {string} outputPath - Optional output file path
 * @returns {Promise<string>} - Plain text content
 */
async function generatePlainText(resumeContent, outputPath = null) {
  try {
    let text = '';

    // Header - Name
    if (resumeContent.personalInfo?.name) {
      text += resumeContent.personalInfo.name.toUpperCase() + '\n';
    }

    // Contact Information
    const contactInfo = [];
    if (resumeContent.personalInfo?.email) contactInfo.push(resumeContent.personalInfo.email);
    if (resumeContent.personalInfo?.phone) contactInfo.push(resumeContent.personalInfo.phone);
    if (resumeContent.personalInfo?.linkedin) contactInfo.push(resumeContent.personalInfo.linkedin);

    if (contactInfo.length > 0) {
      text += contactInfo.join(' | ') + '\n';
    }
    text += '\n';

    // Professional Summary
    if (resumeContent.summary) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += '='.repeat(50) + '\n';
      text += resumeContent.summary + '\n\n';
    }

    // Experience
    if (resumeContent.experience && resumeContent.experience.length > 0) {
      text += 'PROFESSIONAL EXPERIENCE\n';
      text += '='.repeat(50) + '\n';

      resumeContent.experience.forEach((exp) => {
        text += `${exp.role || 'Position'}`;
        if (exp.company) text += ` - ${exp.company}`;
        if (exp.duration) text += ` | ${exp.duration}`;
        text += '\n';

        if (exp.bullets && Array.isArray(exp.bullets)) {
          exp.bullets.forEach((bullet) => {
            text += `  • ${bullet}\n`;
          });
        }
        text += '\n';
      });
    }

    // Skills
    if (resumeContent.skills) {
      text += 'SKILLS\n';
      text += '='.repeat(50) + '\n';

      if (resumeContent.skills.technical && resumeContent.skills.technical.length > 0) {
        text += `Technical: ${resumeContent.skills.technical.join(', ')}\n`;
      }

      if (resumeContent.skills.soft && resumeContent.skills.soft.length > 0) {
        text += `Soft Skills: ${resumeContent.skills.soft.join(', ')}\n`;
      }

      if (resumeContent.skills.tools && resumeContent.skills.tools.length > 0) {
        text += `Tools: ${resumeContent.skills.tools.join(', ')}\n`;
      }
      text += '\n';
    }

    // Education
    if (resumeContent.education && resumeContent.education.length > 0) {
      text += 'EDUCATION\n';
      text += '='.repeat(50) + '\n';

      resumeContent.education.forEach((edu) => {
        text += `${edu.degree || 'Degree'}`;
        if (edu.institution) text += ` - ${edu.institution}`;
        if (edu.year) text += ` | ${edu.year}`;
        text += '\n';

        if (edu.details) {
          text += `  ${edu.details}\n`;
        }
        text += '\n';
      });
    }

    // Additional Sections
    if (resumeContent.additionalSections && resumeContent.additionalSections.length > 0) {
      resumeContent.additionalSections.forEach((section) => {
        text += `${section.title.toUpperCase()}\n`;
        text += '='.repeat(50) + '\n';

        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item) => {
            text += `  • ${item}\n`;
          });
        }
        text += '\n';
      });
    }

    if (outputPath) {
      fs.writeFileSync(outputPath, text, 'utf8');
    }

    return text;
  } catch (error) {
    throw new Error(`Error generating plain text: ${error.message}`);
  }
}

/**
 * Exports resume in the specified format
 * @param {Object} resumeContent - The resume content object
 * @param {string} format - Export format: 'pdf', 'docx', or 'txt'
 * @param {string} outputPath - Optional output file path
 * @returns {Promise<Buffer|string>} - Exported file buffer or text
 */
async function exportResume(resumeContent, format, outputPath = null) {
  // Extract personal info from resumeContent if not already structured
  if (!resumeContent.personalInfo && resumeContent.userAnswers) {
    resumeContent.personalInfo = {
      name: resumeContent.userAnswers.full_name || resumeContent.userAnswers.name,
      email: resumeContent.userAnswers.email,
      phone: resumeContent.userAnswers.phone,
      linkedin: resumeContent.userAnswers.linkedin_url || resumeContent.userAnswers.linkedin,
    };
  }

  switch (format.toLowerCase()) {
    case 'pdf':
      return await generatePDF(resumeContent, outputPath);
    case 'docx':
      return await generateDOCX(resumeContent, outputPath);
    case 'txt':
    case 'text':
      return await generatePlainText(resumeContent, outputPath);
    default:
      throw new Error(`Unsupported format: ${format}. Supported formats: pdf, docx, txt`);
  }
}

module.exports = {
  exportResume,
  generatePDF,
  generateDOCX,
  generatePlainText,
};

