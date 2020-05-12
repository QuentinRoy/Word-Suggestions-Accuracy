import React, { useState } from "react";
import PropTypes from "prop-types";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import classes from "./ConsentForm.module.scss";
import TaskPaper from "../experiment/components/TaskPaper";

// Utility component.

const Email = ({ children }) => <a href={`mailto:${children}`}>{children}</a>;
Email.propTypes = {
  children: PropTypes.string.isRequired,
};

// Fields.

const CoInvestigators = () => (
  <>
    Dr. Quentin Roy, Postdoc Researcher, School of Computer Science, University
    of Waterloo, Canada, <Email>quentin.roy@uwaterloo.ca</Email>
    <br />
    Dr. Géry Casiez, Adjunct Professor, School of Computer Science, University
    of Waterloo, Canada, <Email>gery.casiez@uwaterloo.ca</Email>
  </>
);

const OverviewDescription = () => (
  <>
    In this experiment, you will complete simple tasks to test how you choose to
    use a graphical user interface.
  </>
);
const Duration = () => "1-hour-long";

const TaskDescription = () => (
  <>
    type text or manipulate graphical widgets to complete simple tasks such as
    answering general questions, selecting objects in an image, or moving
    graphical objects
  </>
);

const ParticipationRequirements = () => (
  <>
    you must be able to enter text on a computer and control a computer cursor
    using a mouse, touchpad, or similar pointing device. In addition, you must
    be able to bring your own phone, a touch tablet, and a laptop or desktop
    computer.
  </>
);

const Remuneration = () => "$10";

const MainContact = () => (
  <>
    Dr. Quentin Roy by email at <Email>quentin.roy@uwaterloo.ca</Email>
  </>
);

const HostingCompany = () => (
  <>Amazon Web Services, Inc. and the University of Waterloo</>
);

// Body of the consent form.

const ConsentForm = ({ onAdvanceWorkflow }) => {
  const [isConsentApproved, setIsConsentApproved] = useState(false);
  return (
    <TaskPaper className={classes.main}>
      <h2>Information Consent Letter for Online Studies</h2>
      <h3>
        Title of the study: Evaluation of Human-Computer Interaction Techniques
      </h3>
      <p>
        <em>Principal Investigator/Faculty Supervisor:</em>
        <br />
        Dr. Daniel Vogel, Associate Professor, School of Computer Science,
        University of Waterloo, Canada, 519-888-4567 ext. 33561,{" "}
        <Email>dvogel@uwaterloo.ca</Email>
      </p>
      <p>
        <em>Co-Investigator:</em>
        <br />
        <CoInvestigators />
      </p>
      <p>
        To help you make an informed decision regarding your participation, this
        letter will explain what the study is about, the possible risks and
        benefits, and your rights as a research participant.
      </p>
      <h3>What is the study about?</h3>
      <p>
        You are invited to participate in a research study examining methods for
        people to interact with computers and other digital devices.{" "}
        <OverviewDescription /> This is important because understanding the
        characteristics and performance of human-computer interaction can
        discover new interaction methods and improve existing interaction
        methods. The results of this study contribute to graduate theses and
        faculty research.
      </p>
      <h2>1. Your responsibilities as a participant</h2>
      <h3>What does participation involve?</h3>
      <p>
        Participation in the study will consist of a <Duration /> session.
        During a session, you will be asked to <TaskDescription />. You may also
        be interacting with an experimenter during the session using a remote
        conferencing system.
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
        In order to participate in the study: <ParticipationRequirements />
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
        In appreciation of your time, you will receive <Remuneration />. If you
        begin a session but decide to withdraw, your participation in the study
        will end and you will be remunerated for the proportion of what you
        completed, up to half the full session remuneration. Please contact{" "}
        <MainContact /> for instructions to receive partial remuneration if you
        withdraw.
      </p>
      <h3>What are the risks associated with the study?</h3>
      <p>
        There is potential for minor discomfort or fatigue from performing
        repeated tasks, but the physical requirements of the task are like
        normal computer usage and/or common real-world tasks. We will minimize
        this risk by requiring and/or encouraging rest breaks.
      </p>
      <p>
        The study server is hosted by <HostingCompany /> . If interacting
        &ldquo;live&rdquo; with the experimenter, one of the following
        conferencing systems will be used: Microsoft Skype, Zoom, Cisco WebEx,
        Jitsi Meet, or Google Meet. In either case, when information is
        transmitted or stored on the internet, privacy cannot be guaranteed.
        There is always a risk your responses may be intercepted by a third
        party (e.g., government agencies, hackers).
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
        There will be no association between your identity and the research data
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
      <p>
        You will be explicitly asked for consent for the use of any
        photo/video/audio data for the purpose of reporting the study’s
        findings. If consent is granted, these data will be used only for the
        purposes associated with teaching, scientific presentations,
        publications, and/or sharing with other researchers. You will not be
        identified by name, and where possible, the images will be anonymized.
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
        at 1-519-888-4567 ext. 36005 or <Email>ore-ceo@uwaterloo.ca</Email>.
      </p>
      <h3>
        Who should I contact if I have questions regarding my participation in
        the study?
      </h3>
      <p>
        If you have any questions regarding this study, or would like additional
        information to assist you in reaching a decision about participation,
        please contact <MainContact /> or Dr. Daniel Vogel at 516.888.4567
        x33561 or by email at <Email>dvogel@uwaterloo.ca</Email>. You can also
        contact any member of the research team listed at the top of this
        consent letter.
      </p>

      <h2>Consent Form</h2>
      <p>
        By providing your consent, you are not waiving your legal rights or
        releasing the investigator(s) or involved institution(s) from their
        legal and professional responsibilities.
      </p>
      <ul>
        <li>
          I have read the information presented above about a study led by Dr.
          Daniel Vogel, School of Computer Science, University of Waterloo,
          Canada. I have had the opportunity to contact the investigators with
          questions related to the study and have received satisfactory answers
          to my questions and any additional details.
        </li>
        <li>
          I was informed that participation in the study is voluntary and that I
          can withdraw this consent by informing the researcher.
        </li>
        <li>
          I’m aware that the study session may be recorded for the purpose of
          tracking my movement and actions for analyses purposes.
        </li>
        <li>
          I agree to the use of anonymous quotations in any thesis, dataset, or
          publication that comes from this research.
        </li>
        <li>
          I understand the remuneration I receive may be taxable: it is my
          responsibility to report this amount for income tax purposes if
          required.
        </li>
      </ul>
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
    </TaskPaper>
  );
};

ConsentForm.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
};

export default ConsentForm;
