import React, { useState } from "react";
import PropTypes from "prop-types";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import classes from "./styles/ConsentForm.module.scss";

const duration = 20; // (minutes)
const remuneration = 2; // (dollars)

const ConsentForm = ({ onAdvanceWorkflow }) => {
  const [isConsentApproved, setIsConsentApproved] = useState(false);
  return (
    <div className={classes.main}>
      <h1>Evaluation of Human-Computer Interaction Techniques</h1>
      <p>
        <em>Principal Investigator/Faculty Supervisor:</em>
        <br />
        Dr. Daniel Vogel, Associate Professor, School of Computer Science,
        University of Waterloo, Canada, 519-888-4567 ext. 33561,{" "}
        <a href="mailto:dvogel@uwaterloo.ca">dvogel@uwaterloo.ca</a>
      </p>
      <p>
        <em>Co-Investigator:</em>
        <br />
        Dr. Quentin Roy, Postdoc Researcher, School of Computer Science,
        University of Waterloo, Canada,{" "}
        <a href="mailto:quentin.roy@uwaterloo.ca">quentin.roy@uwaterloo.ca</a>
        <br />
        Dr. Géry Casiez, Adjunct Professor, School of Computer Science,
        University of Waterloo, Canada,{" "}
        <a href="mailto:gery.casiez@uwaterloo.ca">gery.casiez@uwaterloo.ca</a>
      </p>
      <p>
        To help you make an informed decision regarding your participation, this
        letter will explain what the study is about, the possible risks and
        benefits, and your rights as a research participant.
      </p>
      <h3>What is the study about?</h3>
      <p>
        You are invited to participate in a research study examining methods for
        people to interact with computers and other digital devices. In this
        experiment, you will complete simple tasks to test how you choose to use
        a graphical user interface. This is important because understanding the
        characteristics and performance of human-computer interaction can
        discover new interaction methods and improve existing interaction
        methods. The results of this study contribute to graduate theses and
        faculty research.
      </p>
      <h2>1. Your responsibilities as a participant</h2>
      <h3>What does participation involve?</h3>
      <p>
        Participation in the study will consist of a {duration}-minute-long
        session. During a session, you will be asked to type text or manipulate
        graphical widgets to complete simple tasks such as answering general
        questions, selecting objects in an image, or moving graphical objects.
        The questions or images are not personal or controversial in nature.
      </p>
      <p>
        During the experiment, you may also be asked for your opinion of the
        techniques and tasks regarding factors such as overall preference,
        fatigue, comfort, speed, accuracy, utility, suitability, etc. You may
        decline to respond to questions if you wish. If you wish to decline a
        written question, leave it blank.
      </p>
      <p>
        Your computer interactions will also be captured and stored in a
        computer log file.
      </p>
      <h3>Who may participate in the study?</h3>
      <p>
        In order to participate in the study: you must be able to enter text on
        a computer and control a computer cursor using a mouse, touchpad, or
        similar pointing device.
      </p>
      <h2>2. Your rights as a participant</h2>
      <h3>What are the possible benefits of the study?</h3>
      <p>
        Participation in this study may not provide any personal benefit to you.
        The study will benefit the academic community and society in general by
        contributing a better understanding of human-computer interaction and
        potentially inventing new methods of interaction.
      </p>
      <h3>Will I receive payment for participating in the study?</h3>
      <p>
        In appreciation of your time, you will receive ${remuneration}. If you
        begin a session but decide to withdraw, your participation in the study
        will end and you will be remunerated for the proportion of what you
        completed, up to half the full session remuneration. Please contact Dr.
        Quentin Roy at{" "}
        <a href="mailto:quentin.roy@uwaterloo.ca">quentin.roy@uwaterloo.ca</a>{" "}
        for instructions to receive partial remuneration if you withdraw.
      </p>
      <h3>What are the risks associated with the study?</h3>
      <p>
        There is potential for minor discomfort or fatigue from performing
        repeated tasks, but the physical requirements of the task are like
        normal computer usage and/or common real-world tasks. We will minimize
        this risk by requiring and/or encouraging rest breaks.
      </p>
      <p>
        The study server is hosted by Amazon Web Services, Inc., when
        information is transmitted or stored on the internet, privacy cannot be
        guaranteed. There is always a risk your responses may be intercepted by
        a third party (e.g., government agencies, hackers).
      </p>
      <h3>Is participation in the study voluntary?</h3>
      <p>
        Your participation in this study is voluntary. You may decide to
        withdraw from the study at any time by communicating this to the
        researcher.
      </p>
      <h3>Will my identity be known?</h3>
      <p>
        The research team will know which data is from your participation, but
        all data will be anonymized for analysis, reporting, and public data
        sharing.
      </p>
      <h3>Will my information be kept confidential?</h3>
      <p>
        There will be no association between your identify and the research data
        as you are not asked to provide your name or any identifying
        information. In all cases, participants will only be referred to using
        generic labels (P1, P2, …) or collectively as a group (Group A, Group
        B,…). The research data will be accessible by the study investigators as
        well as the broader scientific community. More specifically, the data
        may be posted on public databases and/or made available to other
        researchers upon publication, so that data may be inspected and analyzed
        by other researchers. The data that will be shared will not contain any
        information that could be used to identify you (e.g., worker ID).
      </p>

      <h2>3. Questions, comments, or concerns</h2>
      <h3>Who is sponsoring/funding this study?</h3>
      <p>
        This study is funded/sponsored by the Natural Sciences and Engineering
        Research Council of Canada (NSERC), the Province of Ontario, and the
        University of Waterloo.
      </p>
      <h3>Has the study received ethics clearance?</h3>
      <p>
        This study has been reviewed and received ethics clearance through a
        University of Waterloo Research Ethics Committee (ORE# 31173). If you
        have questions for the Committee contact the Office of Research Ethics
        at 1-519-888-4567 ext. 36005 or ore-ceo@uwaterloo.ca.
      </p>
      <h3>
        Who should I contact if I have questions regarding my participation in
        the study?
      </h3>
      <p>
        If you have any questions regarding this study, or would like additional
        information to assist you in reaching a decision about participation,
        please contact Dr. Quentin Roy by email at{" "}
        <a href="mailto:quentin.roy@uwaterloo.ca">quentin.roy@uwaterloo.ca</a>{" "}
        or Dr. Daniel Vogel at 516.888.4567 x33561 or by email at{" "}
        <a href="mailto:dvogel@uwaterloo.ca">dvogel@uwaterloo.ca</a>. You can
        also contact any member of the research team listed at the top of this
        consent letter.
      </p>

      <h2>Consent Form</h2>
      <p>
        By providing your consent, you are not waiving your legal rights or
        releasing the investigator(s) or involved institution(s) from their
        legal and professional responsibilities.
      </p>
      <p>
        I have read the information presented above about a study led by Dr.
        Daniel Vogel, School of Computer Science, University of Waterloo,
        Canada. I have had the opportunity to contact the investigators with
        questions related to the study and have received satisfactory answers to
        my questions and any additional details.
      </p>
      <p>
        I was informed that participation in the study is voluntary and that I
        can withdraw this consent by informing the researcher.
      </p>
      <p>
        <FormControlLabel
          control={
            <Checkbox
              checked={isConsentApproved}
              onChange={() => {
                setIsConsentApproved(!isConsentApproved);
              }}
              value="consent"
              color="primary"
            />
          }
          label="I agree of my own free will to participate in the study."
        />
      </p>
      <p className={classes.controls}>
        <Button
          variant="contained"
          color="primary"
          type="button"
          disabled={!isConsentApproved}
          onClick={onAdvanceWorkflow}
        >
          Continue
        </Button>
      </p>
    </div>
  );
};

ConsentForm.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default ConsentForm;
