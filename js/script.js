document.addEventListener('DOMContentLoaded', () => {

    // ============ INTERSECTION OBSERVER ============
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));

    // ============ NAVBAR SCROLL ============
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ============ MOBILE NAVIGATION MENU ============
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileNavToggle && navLinks) {
        mobileNavToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            const icon = mobileNavToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('mobile-active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Mobile dropdown toggles
        document.querySelectorAll('.nav-links .dropdown > a').forEach(dropdownToggle => {
            dropdownToggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = dropdownToggle.parentElement;
                    parent.classList.toggle('dropdown-open');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains('mobile-active')) {
                navLinks.classList.remove('mobile-active');
                const icon = mobileNavToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // ============ ANIMATED COUNTER ============
    const counters = document.querySelectorAll('.counter');
    if (counters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000;
                    const startTime = performance.now();

                    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

                    const updateCounter = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easedProgress = easeOutQuart(progress);
                        const currentValue = Math.floor(easedProgress * target);

                        counter.textContent = currentValue.toLocaleString('en-IN');

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target.toLocaleString('en-IN');
                        }
                    };

                    requestAnimationFrame(updateCounter);
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => counterObserver.observe(c));
    }

    // ============ PARTICLE GENERATOR ============
    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = (Math.random() * 4 + 2) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
            particle.style.animationDelay = (Math.random() * 8) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particleContainer.appendChild(particle);
        }
    }

    // ============ SMOOTH SCROLL FOR ANCHOR LINKS ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============ FORM → WHATSAPP REDIRECT ============
    const WHATSAPP_NUMBER = '917090579855';

    const cleanLabel = (text) =>
        (text || '')
            .replace(/\*/g, '')
            .replace(/\s+/g, ' ')
            .trim();

    const getSectionTitle = (el) => {
        const section = el.closest('.form-section');
        if (!section) return '';
        const h3 = section.querySelector('.form-section-header h3');
        if (!h3) return '';
        const clone = h3.cloneNode(true);
        clone.querySelectorAll('small').forEach((s) => s.remove());
        return cleanLabel(clone.textContent);
    };

    const getFieldLabel = (el) => {
        const group = el.closest('.form-group') || el.closest('div');
        let label = '';

        if (group) {
            const labelEl = group.querySelector('.form-label, label');
            if (labelEl) label = cleanLabel(labelEl.textContent);
        }

        if (!label && el.labels && el.labels.length) {
            label = cleanLabel(el.labels[0].textContent);
        }

        // Disambiguate Current vs Permanent City/State/PIN
        if (/^(City|State|PIN Code)$/i.test(label)) {
            const sectionBody = el.closest('.form-section-body');
            if (sectionBody && group) {
                const groups = [...sectionBody.querySelectorAll('.form-group')];
                const idx = groups.indexOf(group.closest('.form-group') || group);
                for (let i = idx - 1; i >= 0; i--) {
                    const prevLabel = groups[i].querySelector('.form-label');
                    const prevText = prevLabel ? cleanLabel(prevLabel.textContent) : '';
                    if (/Permanent Address/i.test(prevText)) {
                        label = `Permanent ${label}`;
                        break;
                    }
                    if (/Residential Address|Current/i.test(prevText)) {
                        label = `Current ${label}`;
                        break;
                    }
                }
            }
        }

        // Disambiguate Reference 1 / Reference 2 fields
        if (/^(Name|Relationship|Mobile Number)$/i.test(label)) {
            const sectionBody = el.closest('.form-section-body');
            if (sectionBody) {
                const headings = [...sectionBody.querySelectorAll('h4')];
                let nearest = '';
                headings.forEach((h) => {
                    if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
                        nearest = cleanLabel(h.textContent);
                    }
                });
                if (nearest) label = `${nearest} — ${label}`;
            }
        }

        return label || el.name || el.placeholder || 'Field';
    };

    const collectFormLines = (form) => {
        const lines = [];
        const seenRadios = new Set();
        const docChecks = [];
        let lastSection = '';

        const maybeSectionHeader = (el) => {
            const section = getSectionTitle(el);
            if (section && section !== lastSection) {
                lastSection = section;
                lines.push('');
                lines.push(`*—— ${section} ——*`);
            }
        };

        form.querySelectorAll('input, select, textarea').forEach((el) => {
            if (el.type === 'submit' || el.type === 'button' || el.type === 'hidden' || el.type === 'file') {
                return;
            }

            // Declaration acceptance — skip from message body
            if (el.type === 'checkbox' && el.closest('.declaration-box')) {
                return;
            }

            // Document checklist
            if (el.type === 'checkbox' && el.closest('.checkbox-group')) {
                if (el.checked) {
                    const lbl = form.querySelector(`label[for="${el.id}"]`);
                    docChecks.push(lbl ? cleanLabel(lbl.textContent) : 'Yes');
                }
                return;
            }

            if (el.type === 'radio') {
                if (!el.name || seenRadios.has(el.name)) return;
                seenRadios.add(el.name);
                const checked = form.querySelector(`input[name="${el.name}"]:checked`);
                if (!checked) return;
                maybeSectionHeader(checked);
                lines.push(`*${getFieldLabel(checked)}:* ${checked.value}`);
                return;
            }

            if (el.readOnly && !String(el.value || '').trim()) return;

            const value = String(el.value || '').trim();
            if (!value) return;

            maybeSectionHeader(el);
            lines.push(`*${getFieldLabel(el)}:* ${value}`);
        });

        if (docChecks.length) {
            lines.push('');
            lines.push(`*—— Documents Submitted ——*`);
            lines.push(docChecks.map((d) => `• ${d}`).join('\n'));
        }

        return lines.filter((line, i, arr) => !(line === '' && (i === 0 || arr[i - 1] === '')));
    };

    const buildWhatsAppUrl = (message) =>
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const redirectFormToWhatsApp = (form) => {
        const title =
            form.getAttribute('data-form-title') ||
            (form.id === 'membershipForm'
                ? 'Membership Application'
                : form.id === 'guarantorForm'
                  ? 'Guarantor Application'
                  : form.id === 'contactForm'
                    ? 'Contact Inquiry'
                    : 'Website Inquiry');

        const lines = collectFormLines(form);
        let message = [
            `*Scallops Fincorp*`,
            `*${title}*`,
            '',
            ...lines,
            '',
            '_Sent from website_',
        ].join('\n');

        // WhatsApp URL length limit — trim from the end if needed
        let url = buildWhatsAppUrl(message);
        while (url.length > 1800 && lines.length > 3) {
            lines.pop();
            message = [
                `*Scallops Fincorp*`,
                `*${title}*`,
                '',
                ...lines,
                '',
                '_…message truncated — full details on request_',
                '_Sent from website_',
            ].join('\n');
            url = buildWhatsAppUrl(message);
        }

        // Full-page redirect opens WhatsApp reliably on mobile & desktop
        window.location.href = url;
    };

    // Membership + Guarantor (+ contact) → WhatsApp
    ['membershipForm', 'guarantorForm', 'contactForm'].forEach((id) => {
        const form = document.getElementById(id);
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            redirectFormToWhatsApp(form);
        });
    });

    // Auto-calculate age from DOB on application forms
    document.querySelectorAll('input[type="date"]').forEach((dobInput) => {
        const group = dobInput.closest('.form-row, .form-group');
        if (!group) return;
        const ageInput = group.parentElement?.querySelector('input[type="number"][readonly]');
        if (!ageInput || !/age/i.test(getFieldLabel(ageInput))) return;

        dobInput.addEventListener('change', () => {
            if (!dobInput.value) {
                ageInput.value = '';
                return;
            }
            const birth = new Date(dobInput.value);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            ageInput.value = age >= 0 ? age : '';
        });
    });

});
