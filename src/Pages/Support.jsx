import React from "react";
import { Helmet } from "react-helmet";
import { useUser } from "../Context/UserProvider";
import PageTitle from "../Components/UI/PageTitle";
import plus_icon from "../assets/Icons/upload.jpg";
import DescriptionBox from "../Components/DescriptionBox";

const Support = () => {
  const { currentUser } = useUser();

  return (
    <>
      <Helmet>
        <title>Support | Shammarianas</title>
        <meta name="description" content="Report your Issue to Shammarianas" />
      </Helmet>

      {currentUser ? (
        <div className="page_content">
          <div className="upload_section">
            <form>
              <PageTitle title="Report an Issue" />
              <div className="content">
                <div className="left">
                  <input name="subject" placeholder="Subject" required />
                  <input type="file" name="file" />
                  <label className="thumbnail_input_label">
                    <img className="upload_icon" src={plus_icon} alt="" />
                    <span className="placeholder">Choose Report</span>
                  </label>
                </div>
                <div className="right">
                  <DescriptionBox name="description" />
                  <select name="issueType" required className="select_field">
                    <option value="" disabled>
                      Select Issue Type
                    </option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Issue</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
              </div>
              <button type="submit">Submit Report</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="page_content">
          <div className="not_logged_in">
            <h2>Log in to Report an Issue</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Support;
