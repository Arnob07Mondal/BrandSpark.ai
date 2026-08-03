import type { BrandBookSection } from './brandBookService'

/**
 * Downloads a client-side file blob.
 */
function downloadFile(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface ExporterSectionContent {
  companyName?: string
  industry?: string
  website?: string
  description?: string
  brandNames?: Array<{ name: string; meaning: string; score: number }>
  imageUrl?: string
  prompt?: string
  logoPrompt?: string
  styleNotes?: string
  colors?: Array<{ name: string; hex: string; role: string }>
  primaryFont?: string
  secondaryFont?: string
  usageGuidelines?: string
  mission?: string
  vision?: string
  story?: string
  voiceTone?: string
  guidelines?: string[]
  slogan?: string
  explanation?: string
  valueProp?: string
}

/**
 * Formats a section content to a plain text representation.
 */
function sectionToPlainText(section: BrandBookSection): string {
  const res = section.content as ExporterSectionContent | null | undefined
  if (!res) return '(No content generated for this section)'

  if (section.id === 'cover') {
    return `${res.companyName}\n${res.industry}\n${res.website || ''}`
  }
  if (section.id === 'overview') {
    return res.description || ''
  }
  if (section.id === 'name' && res.brandNames) {
    return res.brandNames.map((n: { name: string; meaning: string; score: number }) => `- ${n.name}: ${n.meaning} (Memorability: ${n.score}/10)`).join('\n')
  }
  if (section.id === 'logo') {
    return `Logo Asset Link: ${res.imageUrl}\nPrompt Guidelines: ${res.prompt}`
  }
  if (section.id === 'logo-guidelines') {
    return `Guidelines: ${res.logoPrompt || ''}\nStyle notes: ${res.styleNotes || ''}`
  }
  if (section.id === 'palette' && res.colors) {
    return res.colors.map((c: { name: string; hex: string; role: string }) => `- ${c.name} (${c.hex}) [Role: ${c.role}]`).join('\n')
  }
  if (section.id === 'typography') {
    return `Primary: ${res.primaryFont}\nSecondary: ${res.secondaryFont}\nGuidelines: ${res.usageGuidelines}`
  }
  if (section.id === 'mission') {
    return res.mission || ''
  }
  if (section.id === 'vision') {
    return res.vision || ''
  }
  if (section.id === 'story') {
    return res.story || ''
  }
  if (section.id === 'voice') {
    return `Voice tone: ${res.voiceTone || ''}\nGuidelines:\n${res.guidelines?.map((g: string) => ` - ${g}`).join('\n') || ''}`
  }
  if (section.id === 'slogan') {
    return `Slogan: ${res.slogan || ''}\nExplanation: ${res.explanation || ''}`
  }
  if (section.id === 'value-prop') {
    return `Value Proposition: ${res.valueProp || ''}`
  }

  return typeof res === 'string' ? res : JSON.stringify(res)
}

/**
 * Formats a section content to Markdown.
 */
function sectionToMarkdown(section: BrandBookSection): string {
  const text = sectionToPlainText(section)
  return `## ${section.title}\n\n${text}\n\n`
}

export function exportToTXT(companyName: string, sections: BrandBookSection[]) {
  const visible = sections.filter((s) => s.visible)
  const header = `=========================================\n${companyName.toUpperCase()} BRAND BOOK\n=========================================\n\n`
  const body = visible.map((s) => `### ${s.title}\n\n${sectionToPlainText(s)}\n\n`).join('\n')
  downloadFile(header + body, 'text/plain;charset=utf-8;', `${companyName.toLowerCase().replace(/ /g, '_')}_brand_book.txt`)
}

export function exportToMD(companyName: string, sections: BrandBookSection[]) {
  const visible = sections.filter((s) => s.visible)
  const header = `# ${companyName} Brand Guidelines Book\n\nGenerated via BrandSpark AI.\n\n`
  const body = visible.map((s) => sectionToMarkdown(s)).join('\n')
  downloadFile(header + body, 'text/markdown;charset=utf-8;', `${companyName.toLowerCase().replace(/ /g, '_')}_brand_book.md`)
}

export function exportToHTML(companyName: string, sections: BrandBookSection[], theme: string) {
  const visible = sections.filter((s) => s.visible)
  const body = visible
    .map((s) => {
      const text = sectionToPlainText(s).replace(/\n/g, '<br />')
      return `<section style="margin-bottom: 40px; page-break-after: always;">
        <h2 style="border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">${s.title}</h2>
        <p style="font-size: 14px; line-height: 1.6;">${text}</p>
      </section>`
    })
    .join('\n')

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>${companyName} - Brand Book (${theme})</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 50px; color: #1e293b; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 32px; color: #0f172a; margin-bottom: 30px; text-align: center; }
        h2 { font-size: 20px; color: #1e3a8a; }
      </style>
    </head>
    <body>
      <h1>${companyName} Brand Book</h1>
      <p style="text-align: center; font-size: 12px; color: #64748b; margin-bottom: 50px;">Theme style: ${theme}</p>
      ${body}
    </body>
  </html>`

  downloadFile(html, 'text/html;charset=utf-8;', `${companyName.toLowerCase().replace(/ /g, '_')}_brand_book.html`)
}

export function exportToPDF(companyName: string, sections: BrandBookSection[], theme: string) {
  const visible = sections.filter((s) => s.visible)
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const pagesHtml = visible
    .map((s) => {
      const plainText = sectionToPlainText(s).replace(/\n/g, '<br />')
      return `
      <div class="page">
        <div class="header">${companyName} — Brand Book Guidelines</div>
        <h2>${s.title}</h2>
        <div class="content">${plainText}</div>
        <div class="footer">Confidential | Theme: ${theme}</div>
      </div>
      `
    })
    .join('\n')

  printWindow.document.write(`
    <html>
      <head>
        <title>${companyName} Brand Book</title>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 0; color: #334155; }
          .page { box-sizing: border-box; height: 100vh; padding: 60px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; position: relative; }
          h2 { color: #0f172a; font-size: 24px; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-top: 0; }
          .content { font-size: 14px; line-height: 1.8; flex-grow: 1; margin-top: 20px; }
          .header { font-size: 10px; text-transform: uppercase; tracking-widest: 1px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
          .footer { font-size: 10px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .page { height: auto; page-break-after: always; min-height: 100vh; }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

export function exportToDOCX(companyName: string, sections: BrandBookSection[], theme: string) {
  // Rich HTML content formatted inside a docx payload wrapper
  const visible = sections.filter((s) => s.visible)
  const body = visible
    .map((s) => `<h2>${s.title}</h2><p>${sectionToPlainText(s).replace(/\n/g, '<br />')}</p><br />`)
    .join('\n')

  const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><title>${companyName} Brand Book</title></head>
    <body>
      <h1>${companyName} Brand Guidelines</h1>
      <p>Theme: ${theme}</p>
      ${body}
    </body>
  </html>`

  downloadFile(docHtml, 'application/msword', `${companyName.toLowerCase().replace(/ /g, '_')}_brand_book.doc`)
}

export function exportToPPTX(companyName: string, sections: BrandBookSection[], theme: string) {
  // HTML layout representing slides wrapper
  const visible = sections.filter((s) => s.visible)
  const slidesHtml = visible
    .map((s) => `
      <div style="page-break-after:always; border:1px solid #ccc; padding:30px; margin-bottom:20px; width:720px; height:540px; background:#fff;">
        <h3>${s.title}</h3>
        <hr />
        <p style="font-size:14px; line-height:1.6;">${sectionToPlainText(s).replace(/\n/g, '<br />')}</p>
      </div>
    `)
    .join('\n')

  const pptHtml = `<html>
    <head><title>${companyName} Slides</title></head>
    <body style="font-family:sans-serif; background:#f3f4f6; padding:40px;">
      <h2>${companyName} - AI Slides Presentation (Theme: ${theme})</h2>
      <p style="font-size:11px; color:#666;">Press Ctrl+P to export these slides directly as landscape pages.</p>
      <br />
      ${slidesHtml}
    </body>
  </html>`

  downloadFile(pptHtml, 'text/html;charset=utf-8', `${companyName.toLowerCase().replace(/ /g, '_')}_brand_slides.html`)
}
