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

package org.taktik.icure.be.ehealth.logic.efact.impl.invoicing;

/**
 * Created with IntelliJ IDEA.
 * User: aduchate
 * Date: 19/08/15
 * Time: 11:13
 * To change this template use File | Settings | File Templates.
 */
public enum InvoicingSideCode {
    None(0),
    Left(1),
    Right(2);
    private int code;

    InvoicingSideCode(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static InvoicingSideCode withSide(int side) {
        for (InvoicingSideCode s : InvoicingSideCode.values()) {
            if (s.getCode() == side) {
                return s;
            }
        }
        return null;

    }
}
