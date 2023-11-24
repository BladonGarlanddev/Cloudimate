import React from 'react';

const Tos = () => (
  <div>
    <h2>Payments and Refunds:</h2>
    <ul>
      <li>
        Subscriptions are automated and will renew and charge customers on a
        monthly basis unless they cancel.
      </li>
      <li>
        If a subscription is canceled but the customer is still charged,
        Cloudimate commits to processing a refund.
      </li>
      <li>
        In circumstances where a subscription is not canceled and a charge is
        incurred, any refund is at Cloudimate's sole discretion.
      </li>
      <li>
        Users on free trials will be automatically charged after the trial
        period ends unless the trial is canceled prior to its conclusion.
      </li>
    </ul>

    <h2>Service Level Agreement (SLA):</h2>
    <ul>
      <li>Cloudimate guarantees an 80% uptime.</li>
      <li>
        Features offered by Cloudimate are not guaranteed to always function.
      </li>
      <li>
        If Cloudimate falls short of the 80% uptime guarantee in any month,
        affected subscribers will be refunded the full monthly subscription fee
        for that month.
      </li>
    </ul>

    <h2>Third-Party Agreements:</h2>
    <ul>
      <li>
        Cloudimate facilitates resource creation in AWS for users. However,
        Cloudimate holds no responsibility for any AWS charges that users might
        incur while interfacing through Cloudimate.
      </li>
      <li>
        Any compromises or vulnerabilities in a user's AWS account resulting
        from actions in Cloudimate is not Cloudimate's responsibility.
      </li>
    </ul>
    <h2>Data Handling:</h2>
    <ul>
      <li>
        Cloudimate might collect user data, which could be shared with
        third-party services.
      </li>
      <li>
        User data will be stored securely, either within an encrypted database
        or an encrypted S3 bucket. Data in transit will also be encrypted.
      </li>
    </ul>
    <h2>Data Loss:</h2>
    <ul>
      <li>
        Cloudimate disclaims any responsibility for data loss, whether within
        its databases or within a user's AWS account.
      </li>
    </ul>
    <h2>User Content:</h2>
    <ul>
      <li>
        Any content uploaded to Cloudimate becomes the property of Cloudimate.
      </li>
    </ul>
    <h2>Limitation of Liability:</h2>
    <ul>
      <li>
        The maximum liability Cloudimate has to any user is the total subscription fees that the user has paid during their entire duration of using Cloudimate.
      </li>
      <li>
        Cloudimate is not liable for damages or losses resulting from user negligence, including but not limited to, account compromises due to lax security practices on the user's part.
      </li>
    </ul>
    <h2>Force Majeure:</h2>
    <ul>
      <li>
        Cloudimate isn't liable for any failures or service interruptions caused by events beyond its reasonable control, such as natural disasters, wars, or governmental actions.
      </li>
    </ul>
    <h2>Indemnification:</h2>
    <ul>
      <li>
        In the event a user or a malicious actor compromises Cloudimate, leading to revenue loss or other damages, that individual is obligated to compensate Cloudimate for the losses incurred.
      </li>
    </ul>
    <h2>Termination:</h2>
    <ul>
      <li>
        Cloudimate reserves the right to terminate any user's access to its services at any time, without prior notice, provided it's in accordance with applicable laws.
      </li>
    </ul>
    <h2>Governing Law:</h2>
    <ul>
      <li>
        These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the state of Ohio, United States of America, without regard to its conflict of law principles. Both parties agree to submit to the personal jurisdiction of a state court located in Tuscarawas County, Ohio or the United States District Court for the Northern District of Ohio, for any actions for which the parties retain the right to seek injunctive or other equitable relief.
      </li>
    </ul>
    {/* ... You can continue to translate the rest of the sections similarly ... */}
  </div>
);

export default Tos;
