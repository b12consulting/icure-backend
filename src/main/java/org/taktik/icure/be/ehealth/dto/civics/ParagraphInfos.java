/*
 * Copyright (C) 2018 Taktik SA
 *
 * This file is part of iCureBackend.
 *
 * iCureBackend is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 as published by
 * the Free Software Foundation.
 *
 * iCureBackend is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with iCureBackend.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.taktik.icure.be.ehealth.dto.civics;

import java.io.Serializable;
import java.util.Date;

import org.taktik.icure.be.ehealth.dto.civics.*;

/**
 * Created with IntelliJ IDEA.
 * User: aduchate
 * Date: 10/06/13
 * Time: 18:41
 * To change this template use File | Settings | File Templates.
 */
public class ParagraphInfos implements Serializable{
    String chapterName;
    String paragraphName;
    Date startDate;
    Date createdTms;
    String createdUserId;
    Date endDate;
    String keyStringNl;
    String keyStringFr;
    String agreementType;
    Long processType;
    String legalReference;
    Date publicationDate;
    Date modificationDate;
    String processTypeOverrule;
    Long paragraphVersion;
    String agreementTypePro;
    String modificationStatus;
    private Long id;

    org.taktik.icure.be.ehealth.dto.civics.VerseInfos headerVerse;

    public String getChapterName() {
        return chapterName;
    }

    public void setChapterName(String chapterName) {
        this.chapterName = chapterName;
    }

    public String getParagraphName() {
        return paragraphName;
    }

    public void setParagraphName(String paragraphName) {
        this.paragraphName = paragraphName;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getCreatedTms() {
        return createdTms;
    }

    public void setCreatedTms(Date createdTms) {
        this.createdTms = createdTms;
    }

    public String getCreatedUserId() {
        return createdUserId;
    }

    public void setCreatedUserId(String createdUserId) {
        this.createdUserId = createdUserId;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getKeyStringNl() {
        return keyStringNl;
    }

    public void setKeyStringNl(String keyStringNl) {
        this.keyStringNl = keyStringNl;
    }

    public String getKeyStringFr() {
        return keyStringFr;
    }

    public void setKeyStringFr(String keyStringFr) {
        this.keyStringFr = keyStringFr;
    }

    public String getAgreementType() {
        return agreementType;
    }

    public void setAgreementType(String agreementType) {
        this.agreementType = agreementType;
    }

    public Long getProcessType() {
        return processType;
    }

    public void setProcessType(Long processType) {
        this.processType = processType;
    }

    public String getLegalReference() {
        return legalReference;
    }

    public void setLegalReference(String legalReference) {
        this.legalReference = legalReference;
    }

    public Date getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(Date publicationDate) {
        this.publicationDate = publicationDate;
    }

    public Date getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(Date modificationDate) {
        this.modificationDate = modificationDate;
    }

    public String getProcessTypeOverrule() {
        return processTypeOverrule;
    }

    public void setProcessTypeOverrule(String processTypeOverrule) {
        this.processTypeOverrule = processTypeOverrule;
    }

    public Long getParagraphVersion() {
        return paragraphVersion;
    }

    public void setParagraphVersion(Long paragraphVersion) {
        this.paragraphVersion = paragraphVersion;
    }

    public String getAgreementTypePro() {
        return agreementTypePro;
    }

    public void setAgreementTypePro(String agreementTypePro) {
        this.agreementTypePro = agreementTypePro;
    }

    public String getModificationStatus() {
        return modificationStatus;
    }

    public void setModificationStatus(String modificationStatus) {
        this.modificationStatus = modificationStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public org.taktik.icure.be.ehealth.dto.civics.VerseInfos getHeaderVerse() {
        return headerVerse;
    }

    public void setHeaderVerse(org.taktik.icure.be.ehealth.dto.civics.VerseInfos headerVerse) {
        this.headerVerse = headerVerse;
    }
}
