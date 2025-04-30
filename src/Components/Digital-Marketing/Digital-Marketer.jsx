"use client";
import React from "react";

function DigitalMarketing() {
  function openAccordion(event) {
    document.querySelectorAll(".accordion-info").forEach((element) => {
      element.classList.remove("active");
      element.style.maxHeight = 0;
      element.parentElement.classList.remove("active");
    });
    event.currentTarget.parentElement.classList.add("active");
    event.currentTarget.nextElementSibling.style.maxHeight = "300px";
    event.currentTarget.nextElementSibling.classList.add("active");
  }
  return (
    <>
      <section className="container section-padding">
        <div className="col-md-6">
          <h6 className="sub-title main-color mb-15">
            Digital Presence That Drives Real Growth
          </h6>

          <div className="text">
            <p className="mb-15">
              In today&apos;s fast-paced digital world, your social media &
              digital marketing presence is key to making a lasting first
              impression. At Sham Marianas, we craft strategies that go beyond
              likes and shares. We focus on creating authentic connections,
              building trust, and driving real action with every piece of
              content and campaign we execute. From captivating posts to
              data-driven ads, we ensure your brand stands out, engages
              meaningfully, and converts followers into loyal customers. Our
              approach emphasizes storytelling, community-building, and
              strategic growth. We align every effort with your brand&apos;s
              goals, focusing on measurable results that drive sustainable
              success. Ready to transform your social media & digital marketing
              into a powerful tool for business growth? Let&apos;s create
              something unforgettable.
            </p>
          </div>
        </div>
      </section>
      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6">
              <div className="img md-mb50">
                <img src="/assets/imgs/arw2.png" alt="" />
              </div>
            </div>
            <div className="col-lg-6 valign">
              <div>
                <div className="sec-head mb-50">
                  <h6 className="sub-title main-color mb-15">
                    Transforming Digital Engagement Into Real Business Growth
                  </h6>
                  <p>
                    Let's face it, nobody scrolls aimlessly nowadays. They
                    scroll to discover, to connect, and to buy. And we&apos;re
                    here to make sure your brand is part of that journey. At
                    Sham Marianas, we combine innovative storytelling with
                    data-driven tactics to craft social media & digital
                    marketing strategies that don&apos;t just capture attention
                    but convert it into real business results. Whether
                    we&apos;re setting your brand&apos;s tone, launching viral
                    campaigns, or guiding customers through tailored marketing
                    funnels, we ensure your content isn&apos;t just seen —
                    it&apos;s remembered, trusted, and acted upon. From product
                    launches to re-engaging past customers, we build digital
                    experiences that deliver not just quick wins but sustained,
                    long-term growth.
                  </p>
                </div>

                <h6 className="sub-title main-color mb-15">
                  Frequently Asked Questions
                </h6>
                <div className="accordion bord">
                  <div
                    className="item active wow fadeInUp"
                    data-wow-delay=".1s"
                  >
                    <div onClick={openAccordion} className="title">
                      <h6>
                        What makes digital marketing different from social
                        media?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Social media marketing (SMM) focuses on promoting brands
                        through social media platforms, while digital marketing
                        is a broader strategy that includes various online
                        channels like SEO, email marketing, and PPC. Using
                        social media to connect with and interact with a larger
                        audience.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        Why do I need professional social media and digital
                        marketing?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Because your audience is online — and so is your
                        competition. A solid strategy helps you cut through the
                        noise, build real connections, and drive results.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Which platforms do you work with?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We manage campaigns and content across Instagram,
                        Facebook, LinkedIn, YouTube, TikTok, and more — wherever
                        your audience is.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Will you create the content too?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Yes! We handle the entire process — from planning to
                        designing, writing, and publishing—so your brand stays
                        consistent and professional.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>Can you run paid ads for me?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Absolutely. We create and manage high-performing ad
                        campaigns focused on conversions, not just impressions.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>How do I measure success?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We provide detailed analytics and monthly performance
                        reports so you can track growth, engagement, and ROI.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>How do I get started?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Simply reach out through our website — we&apos;ll schedule a
                        discovery call and map out your digital success journey.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default DigitalMarketing;
