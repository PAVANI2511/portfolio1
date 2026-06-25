/**
 * PROFESSIONAL CLASSIC PORTFOLIO LOGIC - S PAVANI
 * Vanilla JS Interactions, Physics Cursors, Canvas Particles, and Dynamic Gauges
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Coordinates ---
    let mouse = { x: 0, y: 0 };
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    window.addEventListener('resize', () => {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });


    // ==========================================================================
    // 1. ELEGANT PRELOADER CONTROLLER
    // ==========================================================================
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderCounter = document.getElementById('preloader-counter');

    let progressCount = 0;
    const minTime = 1500; // minimum duration in ms
    const timeStart = performance.now();

    function updatePreloader() {
        const timePassed = performance.now() - timeStart;
        const timeRatio = Math.min((timePassed / minTime) * 100, 100);
        
        if (document.readyState === 'complete') {
            progressCount += 2.5;
        } else {
            progressCount += 1.0;
        }
        
        progressCount = Math.min(progressCount, 100);
        const unifiedProgress = Math.floor((timeRatio + progressCount) / 2);
        
        if (preloaderBar) preloaderBar.style.width = `${unifiedProgress}%`;
        if (preloaderCounter) preloaderCounter.textContent = `${unifiedProgress}%`;

        if (unifiedProgress < 100) {
            requestAnimationFrame(updatePreloader);
        } else {
            setTimeout(() => {
                if (preloader) preloader.classList.add('completed');
                document.body.classList.remove('loading');
                triggerIntroAnimations();
            }, 350);
        }
    }
    requestAnimationFrame(updatePreloader);


    // ==========================================================================
    // 2. PHYSICS CUSTOM CURSOR & MAGNETIC EFFECTORS
    // ==========================================================================
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = cursor.querySelector('.cursor-dot');
    const cursorFollower = cursor.querySelector('.cursor-follower');

    let dotX = 0, dotY = 0;
    let followerX = 0, followerY = 0;
    const lerpDampening = 0.14;

    function renderCursor() {
        // Fast dot
        dotX += (mouse.x - dotX);
        dotY += (mouse.y - dotY);
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;

        // Smooth physics follower
        followerX += (mouse.x - followerX) * lerpDampening;
        followerY += (mouse.y - followerY) * lerpDampening;
        cursorFollower.style.left = `${followerX}px`;
        cursorFollower.style.top = `${followerY}px`;

        requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Bind cursors hovers
    const interactiveElements = document.querySelectorAll('a, button, .magnetic-target, .skills-tab-btn, input, textarea');
    interactiveElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        elem.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        elem.addEventListener('mousedown', () => cursor.classList.add('click'));
        elem.addEventListener('mouseup', () => cursor.classList.remove('click'));
    });

    // Magnetic buttons mechanics
    const magneticElements = document.querySelectorAll('.magnetic-target');
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const bounds = elem.getBoundingClientRect();
            const centerPointX = bounds.left + bounds.width / 2;
            const centerPointY = bounds.top + bounds.height / 2;
            
            const offsetWidth = e.clientX - centerPointX;
            const offsetHeight = e.clientY - centerPointY;
            
            // Draw element towards mouse (max pull force coefficient 0.32)
            elem.style.transform = `translate3d(${offsetWidth * 0.32}px, ${offsetHeight * 0.32}px, 0)`;
        });

        elem.addEventListener('mouseleave', () => {
            elem.style.transform = 'translate3d(0, 0, 0)';
            elem.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        elem.addEventListener('mouseenter', () => {
            elem.style.transition = 'none';
        });
    });


    // ==========================================================================
    // 3. CANVAS PHYSICS GRAPH OVERLAY
    // ==========================================================================
    const canvas = document.getElementById('mesh-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let widthCanvas = canvas.offsetWidth;
        let heightCanvas = canvas.offsetHeight;
        
        canvas.width = widthCanvas;
        canvas.height = heightCanvas;

        class ParticlePoint {
            constructor() {
                this.x = Math.random() * widthCanvas;
                this.y = Math.random() * heightCanvas;
                this.vx = (Math.random() - 0.5) * 0.38;
                this.vy = (Math.random() - 0.5) * 0.38;
                this.radius = Math.random() * 1.8 + 1.2;
            }

            tick() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > widthCanvas) this.vx *= -1;
                if (this.y < 0 || this.y > heightCanvas) this.vy *= -1;

                // Subtle mouse repulsion
                let boundaryRect = canvas.getBoundingClientRect();
                let dx = mouse.x - (boundaryRect.left + this.x);
                let dy = mouse.y - (boundaryRect.top + this.y);
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 110) {
                    this.x += dx * 0.004;
                    this.y += dy * 0.004;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ff5a00'; // Orange accent dots
                ctx.fill();
            }
        }

        const nodes = Array.from({ length: 35 }, () => new ParticlePoint());

        function loop() {
            ctx.clearRect(0, 0, widthCanvas, heightCanvas);
            
            nodes.forEach(node => {
                node.tick();
                node.draw();
            });

            // Draw connecting lines
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 85) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(255, 90, 0, ${0.14 * (1 - dist / 85)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);

        window.addEventListener('resize', () => {
            if (canvas.offsetWidth !== widthCanvas || canvas.offsetHeight !== heightCanvas) {
                widthCanvas = canvas.offsetWidth;
                heightCanvas = canvas.offsetHeight;
                canvas.width = widthCanvas;
                canvas.height = heightCanvas;
            }
        });
    }


    // ==========================================================================
    // 4. INTERACTIVE SKILLS DASHBOARD CONTROLLER
    // ==========================================================================
    const skillsTabButtons = document.querySelectorAll('.skills-tab-btn');
    const skillsPanels = document.querySelectorAll('.skills-panel');

    skillsTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedCategory = btn.getAttribute('data-category');
            
            // Toggle active classes on selectors
            skillsTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle active panels
            skillsPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.getAttribute('id') === selectedCategory) {
                    panel.classList.add('active');
                    animateSkillGauges(panel);
                }
            });
        });
    });

    function animateSkillGauges(container) {
        const fills = container.querySelectorAll('.skill-fill');
        fills.forEach(fill => {
            fill.style.width = '0%';
            setTimeout(() => {
                const targetPercent = fill.getAttribute('data-percent');
                fill.style.width = targetPercent;
            }, 60);
        });
    }

    // Load first default panel
    const defaultPanel = document.querySelector('.skills-panel.active');
    if (defaultPanel) {
        animateSkillGauges(defaultPanel);
    }


    // ==========================================================================
    // 5. STICKY NAVBAR & SCROLL MONITOR
    // ==========================================================================
    const headerElement = document.getElementById('navbar');
    const scrollBar = document.getElementById('scroll-progress');
    const navAnchors = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        const scrolledY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - windowHeight;
        
        // Progress percent
        const percent = (scrolledY / maxScroll) * 100;
        if (scrollBar) scrollBar.style.width = `${percent}%`;

        // Toggle sticky state
        if (scrolledY > 50) {
            headerElement.classList.add('scrolled');
        } else {
            headerElement.classList.remove('scrolled');
        }

        // Active link highlights
        let activeSectionId = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 150;
            const height = sec.offsetHeight;
            if (scrolledY >= top && scrolledY < top + height) {
                activeSectionId = sec.getAttribute('id');
            }
        });

        navAnchors.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    // ==========================================================================
    // 6. SCROLL REVEAL INTERSECTIONS
    // ==========================================================================
    const observerConfig = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Retrigger default skills panel animations if skills section enters
                if (entry.target.classList.contains('skills-dashboard')) {
                    const activeP = entry.target.querySelector('.skills-panel.active');
                    if (activeP) animateSkillGauges(activeP);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerConfig);

    document.querySelectorAll('.scroll-reveal').forEach(el => scrollObserver.observe(el));


    // ==========================================================================
    // 7. MOBILE OVERLAY MENU
    // ==========================================================================
    const hamburgerBtn = document.getElementById('nav-toggle');
    const mobileMenuOverlay = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleHamburger() {
        hamburgerBtn.classList.toggle('open');
        mobileMenuOverlay.classList.toggle('open');
        
        if (mobileMenuOverlay.classList.contains('open')) {
            document.body.classList.add('loading'); // Stop parent background scroll
        } else {
            document.body.classList.remove('loading');
        }
    }

    hamburgerBtn.addEventListener('click', toggleHamburger);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('open');
            mobileMenuOverlay.classList.remove('open');
            document.body.classList.remove('loading');
        });
    });


    // ==========================================================================
    // 8. DISPATCH FORM CONTROLLER (WEB3FORMS INTEGRATION)
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // GET YOUR FREE ACCESS KEY FROM https://web3forms.com AND PASTE IT HERE
    const WEB3FORMS_ACCESS_KEY = "cce60f1c-ba15-4297-9234-357903fad558";

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            formStatus.innerHTML = '<span class="status-sending">Dispatching statement...</span>';
            formStatus.className = 'form-status';
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            submitBtn.disabled = true;
            const submitBtnText = submitBtn.querySelector('span');
            const originalBtnText = submitBtnText.textContent;
            submitBtnText.textContent = 'DISPATCHING STATEMENT...';

            const formData = new FormData(contactForm);
            
            // If the user hasn't set their key, warn them but run the simulation so it doesn't break
            if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
                console.warn("Web3Forms Access Key is not configured. Falling back to simulation mode.");
                setTimeout(() => {
                    formStatus.textContent = 'Demo Mode: Message processed. (Configure your Web3Forms Access Key in script.js to receive real emails!)';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtnText.textContent = originalBtnText;
                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.className = 'form-status';
                    }, 8000);
                }, 1200);
                return;
            }

            formData.append('access_key', WEB3FORMS_ACCESS_KEY);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    formStatus.textContent = 'Statement dispatched successfully! Pavani will contact you shortly.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    console.log(response);
                    formStatus.textContent = json.message || 'Something went wrong. Please try again.';
                    formStatus.className = 'form-status error';
                }
            })
            .catch(error => {
                console.log(error);
                formStatus.textContent = 'Network error. Please check your connection and try again.';
                formStatus.className = 'form-status error';
            })
            .then(() => {
                submitBtn.disabled = false;
                submitBtnText.textContent = originalBtnText;
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);
            });
        });
    }


    // ==========================================================================
    // 9. INTRO ANIMATIONS TRIGGER
    // ==========================================================================
    function triggerIntroAnimations() {
        // Trigger reveal groups in Hero
        const reveals = document.querySelectorAll('#hero .scroll-reveal');
        reveals.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('revealed');
            }, index * 150);
        });
    }

});
