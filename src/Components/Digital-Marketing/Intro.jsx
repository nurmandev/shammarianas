import React from "react";

function Intro() {
  return (
    <section className="intro section-padding">
      <div className="container">
        <div className="row lg-marg">
          <div className="col-lg-8">
            <div className="row lg-marg">
              <div className="col-md-6">
                <div>
                  <h3 className="mb-30">
                    Posting Isn’t Enough — We Cultivate
                    <span className="fw-300">Digital</span>
                    <span className="fw-300">Impact</span>
                  </h3>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text">
                  <p className="mb-15">
                    At Sham Marianas, we elevate social media management into an
                    art — creating digital experiences that grab attention,
                    spark conversations, and drive real business growth. Whether
                    you’re a new brand looking to build your presence or an
                    established name aiming to scale, our social media and
                    digital marketing solutions are tailored for results. From
                    strategic content creation to ROI-driven ad campaigns, we
                    help you connect, engage, and convert — all while staying
                    true to your brand’s voice. With us, your digital success
                    isn’t just possible — it’s inevitable.
                  </p>

                  <div className="mt-30">
                    <ul className="rest dot-list">
                      <li className="mb-10">Social Media Management</li>
                      <li className="mb-10">Targeted Ad Campaigns</li>
                      <li className="mb-10">Content Strategy & Planning</li>
                      <li className="mb-10">Visual Content Creation</li>
                      <li className="mb-10">
                        Performance Tracking & Analytics
                      </li>
                      <li className="mb-10">
                        Influencer & Community Marketing
                      </li>
                      <li className="mb-10">Email Marketing & Automation</li>
                      <li className="mb-10">
                        SEO-Integrated Content for Blogs & Social
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="img-full fit-img">
              <img src="/assets/imgs/intro/2.jpg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
