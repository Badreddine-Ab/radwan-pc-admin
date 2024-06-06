import React, { useState } from "react";
import styles from "./page.module.css";
import Logo from "../../icons/logo";
import Button from "../button/Button";
import { SignIn } from "../signIn/auth_components";
import ModalComponent from "../modal/ModalComponent";
import Userinfo from "../modal/Filter-Modal";
import SignIn_Button from "../signIn/SignIn_Button";

export default function Header() {



  return (
    <div>
      <div className={styles.container}>
        <Logo className={styles.logo} />
        <div className={styles.links}>
          <a href="#" className={styles.link}>
            Accueil
          </a>
          <a href="#" className={styles.link}>
            Le Professeur
          </a>
          <a href="#" className={styles.link}>
            Cours
          </a>
          <a href="#" className={styles.link}>
            Contactez nous
          </a>
        </div>
      <Userinfo />
      <SignIn_Button />
       
      </div>
      
    </div>
  );
}
