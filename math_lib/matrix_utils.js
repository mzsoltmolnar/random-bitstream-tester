// Ported to JavaScript by Zsolt Molnar (https://mzsoltmolnar.github.io/)
// Based on NIST Statistical Test Suite ANSI C code:
// https://csrc.nist.gov/Projects/Random-Bit-Generation/Documentation-and-Software

class MatrixUtils {
    constructor() {
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    R A N K  A L G O R I T H M  R O U T I N E S
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    static MATRIX_FORWARD_ELIMINATION = 0;
    static MATRIX_BACKWARD_ELIMINATION = 1;

    static computeRank(M, Q, matrix) {
        let i, rank, m = Math.min(M, Q);

        /* FORWARD APPLICATION OF ELEMENTARY ROW OPERATIONS */
        for (i = 0; i < m - 1; i++) {
            if (matrix[i][i] === 1)
                this.perform_elementary_row_operations(this.MATRIX_FORWARD_ELIMINATION, i, M, Q, matrix);
            else { 	/* matrix[i][i] = 0 */
                if (this.find_unit_element_and_swap(this.MATRIX_FORWARD_ELIMINATION, i, M, Q, matrix) === 1)
                    this.perform_elementary_row_operations(this.MATRIX_FORWARD_ELIMINATION, i, M, Q, matrix);
            }
        }

        /* BACKWARD APPLICATION OF ELEMENTARY ROW OPERATIONS */
        for (i = m - 1; i > 0; i--) {
            if (matrix[i][i] === 1)
                this.perform_elementary_row_operations(this.MATRIX_BACKWARD_ELIMINATION, i, M, Q, matrix);
            else { 	/* matrix[i][i] = 0 */
                if (this.find_unit_element_and_swap(this.MATRIX_BACKWARD_ELIMINATION, i, M, Q, matrix) === 1)
                    this.perform_elementary_row_operations(this.MATRIX_BACKWARD_ELIMINATION, i, M, Q, matrix);
            }
        }

        rank = this.determine_rank(m, M, Q, matrix);

        return rank;
    }


    static perform_elementary_row_operations(flag, i, M, Q, A) {
        let j, k;

        if (flag === this.MATRIX_FORWARD_ELIMINATION) {
            for (j = i + 1; j < M; j++)
                if (A[j][i] === 1)
                    for (k = i; k < Q; k++)
                        A[j][k] = (A[j][k] + A[i][k]) % 2;
        }
        else {
            for (j = i - 1; j >= 0; j--)
                if (A[j][i] === 1)
                    for (k = 0; k < Q; k++)
                        A[j][k] = (A[j][k] + A[i][k]) % 2;
        }
    }


    static find_unit_element_and_swap(flag, i, M, Q, A) {
        let index, row_op = 0;

        if (flag === this.MATRIX_FORWARD_ELIMINATION) {
            index = i + 1;
            while ((index < M) && (A[index][i] === 0))
                index++;
            if (index < M)
                row_op = this.swap_rows(i, index, Q, A);
        }
        else {
            index = i - 1;
            while ((index >= 0) && (A[index][i] === 0))
                index--;
            if (index >= 0)
                row_op = this.swap_rows(i, index, Q, A);
        }

        return row_op;
    }


    static swap_rows(i, index, Q, A) {
        let p;
        let temp;

        for (p = 0; p < Q; p++) {
            temp = A[i][p];
            A[i][p] = A[index][p];
            A[index][p] = temp;
        }

        return 1;
    }


    static determine_rank(m, M, Q, A) {
        let i, j, rank, allZeroes;

        /* DETERMINE RANK, THAT IS, COUNT THE NUMBER OF NONZERO ROWS */

        rank = m;
        for (i = 0; i < M; i++) {
            allZeroes = 1;
            for (j = 0; j < Q; j++) {
                if (A[i][j] === 1) {
                    allZeroes = 0;
                    break;
                }
            }
            if (allZeroes === 1)
                rank--;
        }

        return rank;
    }

    static create_matrix(M, Q) {
        let i, j;
        let matrix = [];

        for (i = 0; i < M; i++) {
            matrix[i] = [];
            for (j = 0; j < Q; j++) {
                matrix[i][j] = 0;
            }
        }
        return matrix;
    }

    static def_matrix(M, Q, m, k, BinSeq) {
        let i, j;

        for (i = 0; i < M; i++)
            for (j = 0; j < Q; j++)
                m[i][j] = BinSeq[k * (M * Q) + j + i * M];
    }
}